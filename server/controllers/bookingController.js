import mongoose from 'mongoose'

import BookingRequest from '../models/BookingRequest.js'
import BookingFormToken from '../models/BookingFormToken.js'
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
	 * Get approved bookings for a given date to determine venue availability.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async availability(req, res) {
		const dateText = typeof req.query?.date === 'string' ? req.query.date.trim() : ''
		if (!dateText) {
			return res.status(400).json({ message: 'date query parameter is required (YYYY-MM-DD)' })
		}
		const match = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/)
		if (!match) {
			return res.status(400).json({ message: 'Invalid date format' })
		}
		const year = Number(match[1])
		const month = Number(match[2])
		const day = Number(match[3])
		if (!year || !month || !day) {
			return res.status(400).json({ message: 'Invalid date format' })
		}

		const start = new Date(year, month - 1, day)
		if (Number.isNaN(start.getTime())) {
			return res.status(400).json({ message: 'Invalid date format' })
		}
		const end = new Date(year, month - 1, day + 1)

		try {
			const data = await BookingRequest.find({
				status: 'approved',
				'confirmedBooking.date': { $gte: start, $lt: end },
			})
				.populate('confirmedBooking.venue', 'name location')

			return res.json({ data })
		} catch {
			return res.status(500).json({ message: 'Failed to load availability data' })
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
		if (!venueId) {
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

			let venue = null
			if (venueId && mongoose.Types.ObjectId.isValid(venueId)) {
				venue = await Venue.findById(venueId)
			}
			if (!venue) {
				venue = await Venue.findOne({ name: venueId })
			}
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

		const { reason, comments } = req.body || {}
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
				comments: typeof comments === 'string' && comments.trim() ? comments.trim() : String(reason).trim(),
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
					additionalComments: typeof comments === 'string' && comments.trim() ? comments.trim() : '',
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

	/**
	 * Get a booking by one-time token.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async getByToken(req, res) {
		const tokenValue = typeof req.params?.token === 'string' ? req.params.token.trim() : ''
		if (!tokenValue) {
			return res.status(404).json({ status: 'invalid', message: 'Invalid booking link' })
		}

		try {
			const tokenDoc = await BookingFormToken.findOne({ token: tokenValue })
			if (!tokenDoc) {
				return res.status(404).json({ status: 'invalid', message: 'Invalid booking link' })
			}

			if (tokenDoc.status === 'used') {
				return res.status(400).json({ status: 'used', message: 'This form has already been submitted.' })
			}

			if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() < Date.now()) {
				tokenDoc.status = 'expired'
				await tokenDoc.save()
				return res.status(400).json({ status: 'expired', message: 'This booking link has expired.' })
			}

			const booking = await BookingRequest.findById(tokenDoc.bookingRequestId)
			if (!booking) {
				return res.status(404).json({ status: 'invalid', message: 'Invalid booking link' })
			}

			return res.json({
				status: 'active',
				requesterName: booking.requesterName,
				requesterEmail: booking.requesterEmail,
				refCode: tokenDoc.refCode,
			})
		} catch {
			return res.status(500).json({ status: 'invalid', message: 'Invalid booking link' })
		}
	}

	/**
	 * Submit booking form response using token.
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async submitFormResponse(req, res) {
		const tokenValue = typeof req.body?.token === 'string' ? req.body.token.trim() : ''
		if (!tokenValue) {
			return res.status(404).json({ message: 'Invalid token' })
		}

		try {
			const tokenDoc = await BookingFormToken.findOne({ token: tokenValue })
			if (!tokenDoc) {
				return res.status(404).json({ message: 'Invalid token' })
			}

			if (tokenDoc.status === 'used') {
				return res.status(400).json({ message: 'Already submitted' })
			}

			if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() < Date.now()) {
				return res.status(400).json({ message: 'Link expired' })
			}

			const booking = await BookingRequest.findById(tokenDoc.bookingRequestId)
			if (!booking) {
				return res.status(404).json({ message: 'Booking request not found' })
			}

			booking.extractedDetails = booking.extractedDetails || {}
			booking.extractedDetails.venue = req.body?.venue
			booking.extractedDetails.department = req.body?.department
			booking.extractedDetails.eventPurpose = req.body?.purpose
			booking.extractedDetails.requestedDate = req.body?.eventDate
			booking.extractedDetails.timeSlot = req.body?.timeSlot
			booking.extractedDetails.attendance = req.body?.attendance
			booking.extractedDetails.attendees = req.body?.attendees
			booking.extractedDetails.equipment = req.body?.equipment
			booking.extractedDetails.supervisor = req.body?.supervisor
			booking.requesterName = req.body?.name
			booking.status = 'pending'

			tokenDoc.status = 'used'
			tokenDoc.usedAt = new Date()

			await Promise.all([booking.save(), tokenDoc.save()])
			return res.json({ message: 'Form submitted successfully' })
		} catch {
			return res.status(500).json({ message: 'Failed to submit form response' })
		}
	}

	/**
	 * Create an internal booking directly (already approved, no email flow).
	 * @param {import('express').Request} req - Request.
	 * @param {import('express').Response} res - Response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async createInternal(req, res) {
		const { eventPurpose, organizer, venue: venueId, date, timeSlot, isRecurring } = req.body || {}

		if (!eventPurpose || !venueId || !date || !timeSlot?.start || !timeSlot?.end || !organizer) {
			return res.status(400).json({ message: 'eventPurpose, organizer, venue, date, timeSlot.start, and timeSlot.end are all required' })
		}

		const bookingDate = toDate(date)
		if (!bookingDate) {
			return res.status(400).json({ message: 'Invalid date' })
		}

		try {
			let venue = null
			if (mongoose.Types.ObjectId.isValid(venueId)) {
				venue = await Venue.findById(venueId)
			}
			if (!venue) {
				venue = await Venue.findOne({ name: venueId })
			}
			if (!venue) {
				return res.status(404).json({ message: 'Venue not found' })
			}

			const internalId = `internal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

			const booking = new BookingRequest({
				emailMessageId: internalId,
				emailThreadId: internalId,
				requesterEmail: req.user?.email || 'admin@internal',
				requesterName: organizer,
				subject: eventPurpose,
				status: 'approved',
				receivedAt: new Date(),
				extractedDetails: {
					eventPurpose,
					venue: venue.name,
					requestedDate: bookingDate.toISOString().split('T')[0],
					timeSlot: `${String(timeSlot.start).trim()} - ${String(timeSlot.end).trim()}`,
				},
				confirmedBooking: {
					venue: venue._id,
					date: bookingDate,
					timeSlot: {
						start: String(timeSlot.start).trim(),
						end: String(timeSlot.end).trim(),
					},
					approvedAt: new Date(),
					approvedBy: req.user?._id,
				},
				adminActions: [
					{
						action: 'approved',
						performedBy: req.user?._id,
						comments: 'Internal booking created directly by admin',
					},
				],
			})

			await booking.save()
			const populated = await BookingRequest.findById(booking._id).populate('confirmedBooking.venue')
			return res.status(201).json({ message: 'Internal booking created', booking: populated })
		} catch (err) {
			console.error('[createInternal]', err)
			return res.status(500).json({ message: 'Failed to create internal booking' })
		}
	}
}

const bookingController = new BookingController()

export default bookingController

