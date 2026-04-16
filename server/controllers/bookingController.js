import mongoose from 'mongoose'

import BookingRequest from '../models/BookingRequest.js'
import Venue from '../models/Venue.js'
import outboxService from '../services/email/outboxService.js'

/**
 * Parse an integer query parameter safely.
 * @param {any} value - Input value.
 * @param {number} fallback - Default.
 * @param {number} min - Min.
 * @param {number} max - Max.
 * @returns {number} Parsed number.
 */
function parseIntParam(value, fallback, min, max) {
	const n = Number.parseInt(String(value ?? ''), 10)
	const safe = Number.isFinite(n) ? n : fallback
	return Math.min(max, Math.max(min, safe))
}

/**
 * Convert a Date input into a Date instance.
 * @param {any} value - Input date.
 * @returns {Date|null} Date or null.
 */
function toDate(value) {
	if (!value) return null
	const d = value instanceof Date ? value : new Date(value)
	return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Get a friendly event name for emails.
 * @param {any} booking - BookingRequest document.
 * @returns {string} Event name.
 */
function getEventName(booking) {
	const purpose = booking?.extractedDetails?.eventPurpose
	if (typeof purpose === 'string' && purpose.trim()) return purpose.trim()
	const subject = booking?.subject
	if (typeof subject === 'string' && subject.trim()) return subject.trim()
	return 'Event'
}

/**
 * Booking controller.
 */
class BookingController {
	/**
	 * List bookings with pagination and optional status filter.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async list(req, res) {
		const status = typeof req.query?.status === 'string' ? req.query.status.trim() : ''
		const page = parseIntParam(req.query?.page, 1, 1, 100000)
		const limit = parseIntParam(req.query?.limit, 20, 1, 200)

		/** @type {Record<string, any>} */
		const query = {}
		if (status) {
			query.status = status
		}

		try {
			const skip = (page - 1) * limit

			const [data, total] = await Promise.all([
				BookingRequest.find(query)
					.sort({ receivedAt: -1 })
					.skip(skip)
					.limit(limit)
					.populate('confirmedBooking.venue', 'name location'),
				BookingRequest.countDocuments(query),
			])

			const pages = Math.max(1, Math.ceil(total / limit))
			return res.json({
				data,
				pagination: {
					page,
					limit,
					total,
					pages,
				},
			})
		} catch {
			return res.status(500).json({ message: 'Failed to load booking requests' })
		}
	}

	/**
	 * Get a booking by id.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async get(req, res) {
		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid booking id' })
		}

		try {
			const booking = await BookingRequest.findById(id).populate('confirmedBooking.venue')
			if (!booking) {
				return res.status(404).json({ message: 'Booking request not found' })
			}

			return res.json(booking)
		} catch {
			return res.status(500).json({ message: 'Failed to load booking request' })
		}
	}

	/**
	 * Approve a booking request and queue an approval email.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async approve(req, res) {
		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid booking id' })
		}

		const { venueId, date, timeSlot, comments } = req.body || {}
		if (!venueId || !mongoose.Types.ObjectId.isValid(String(venueId))) {
			return res.status(400).json({ message: 'venueId is required' })
		}

		const bookingDate = toDate(date)
		if (!bookingDate) {
			return res.status(400).json({ message: 'date is required' })
		}

		const slot = timeSlot && typeof timeSlot === 'object' ? timeSlot : null
		const start = slot && typeof slot.start === 'string' ? slot.start : ''
		const end = slot && typeof slot.end === 'string' ? slot.end : ''

		if (!start.trim() || !end.trim()) {
			return res.status(400).json({ message: 'timeSlot.start and timeSlot.end are required' })
		}

		try {
			const booking = await BookingRequest.findById(id)
			if (!booking) {
				return res.status(404).json({ message: 'Booking request not found' })
			}

			const venue = await Venue.findById(venueId)
			if (!venue) {
				return res.status(404).json({ message: 'Venue not found' })
			}

			booking.status = 'approved'
			booking.confirmedBooking = {
				venue: venue._id,
				date: bookingDate,
				timeSlot: { start: start.trim(), end: end.trim() },
				approvedAt: new Date(),
				approvedBy: req.user?._id,
			}

			booking.adminActions = Array.isArray(booking.adminActions) ? booking.adminActions : []
			booking.adminActions.push({
				action: 'approved',
				performedBy: req.user?._id,
				comments: typeof comments === 'string' ? comments : undefined,
			})

			await booking.save()

			const subject = `Re: ${booking.subject || 'Booking Request'} - Approved`
			const templateData = {
				name: booking.requesterName,
				venueName: venue.name,
				date: bookingDate.toDateString(),
				timeSlot: `${start.trim()} - ${end.trim()}`,
				eventName: getEventName(booking),
				threadId: booking.emailThreadId,
			}

			await outboxService.queueEmail({
				to: booking.requesterEmail,
				subject,
				templateName: 'approved',
				templateData,
				bookingRequestId: booking._id,
			})

			const populated = await BookingRequest.findById(booking._id).populate('confirmedBooking.venue')
			return res.json({ message: 'Booking approved', booking: populated })
		} catch {
			return res.status(500).json({ message: 'Failed to approve booking' })
		}
	}

	/**
	 * Reject a booking request and queue a rejection email.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async reject(req, res) {
		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid booking id' })
		}

		const { reason } = req.body || {}
		if (!String(reason || '').trim()) {
			return res.status(400).json({ message: 'reason is required' })
		}

		try {
			const booking = await BookingRequest.findById(id)
			if (!booking) {
				return res.status(404).json({ message: 'Booking request not found' })
			}

			booking.status = 'rejected'
			booking.adminActions = Array.isArray(booking.adminActions) ? booking.adminActions : []
			booking.adminActions.push({
				action: 'rejected',
				performedBy: req.user?._id,
				comments: String(reason).trim(),
			})
			await booking.save()

			const subject = `Re: ${booking.subject || 'Booking Request'} - Not Approved`
			await outboxService.queueEmail({
				to: booking.requesterEmail,
				subject,
				templateName: 'rejected',
				templateData: {
					name: booking.requesterName,
					reason: String(reason).trim(),
					threadId: booking.emailThreadId,
				},
				bookingRequestId: booking._id,
			})

			return res.json({ message: 'Booking rejected', booking })
		} catch {
			return res.status(500).json({ message: 'Failed to reject booking' })
		}
	}

	/**
	 * Request clarification and queue a clarification email.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async requestClarification(req, res) {
		const { id } = req.params
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: 'Invalid booking id' })
		}

		const { clarificationRequest } = req.body || {}
		if (!String(clarificationRequest || '').trim()) {
			return res.status(400).json({ message: 'clarificationRequest is required' })
		}

		try {
			const booking = await BookingRequest.findById(id)
			if (!booking) {
				return res.status(404).json({ message: 'Booking request not found' })
			}

			booking.status = 'clarification_requested'
			booking.adminActions = Array.isArray(booking.adminActions) ? booking.adminActions : []
			booking.adminActions.push({
				action: 'clarification_requested',
				performedBy: req.user?._id,
				comments: String(clarificationRequest).trim(),
			})
			await booking.save()

			const subject = `Re: ${booking.subject || 'Booking Request'} - Clarification Required`
			await outboxService.queueEmail({
				to: booking.requesterEmail,
				subject,
				templateName: 'clarification',
				templateData: {
					name: booking.requesterName,
					clarificationRequest: String(clarificationRequest).trim(),
					threadId: booking.emailThreadId,
				},
				bookingRequestId: booking._id,
			})

			return res.json({ message: 'Clarification requested', booking })
		} catch {
			return res.status(500).json({ message: 'Failed to request clarification' })
		}
	}
}

const bookingController = new BookingController()

export default bookingController

