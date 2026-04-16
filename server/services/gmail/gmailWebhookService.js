import process from 'node:process'
import { Buffer } from 'node:buffer'

import { gmail } from '../../config/gmail.js'

/**
 * Decode and parse Pub/Sub payload.
 * Supports either a decoded object ({historyId,emailAddress}) or Pub/Sub envelope
 * with base64-encoded JSON in message.data.
 * @param {any} pubsubData - Pub/Sub payload.
 * @returns {{historyId:(string|null), emailAddress:(string|null)}} Parsed data.
 */
function parsePubsubData(pubsubData) {
	try {
		if (!pubsubData) {
			return { historyId: null, emailAddress: null }
		}

		// If caller already decoded it.
		if (pubsubData.historyId || pubsubData.emailAddress) {
			return {
				historyId: pubsubData.historyId ? String(pubsubData.historyId) : null,
				emailAddress: pubsubData.emailAddress ? String(pubsubData.emailAddress) : null,
			}
		}

		var envelope = pubsubData.message ? pubsubData.message : pubsubData
		var encoded = envelope && envelope.data ? envelope.data : null
		if (!encoded) {
			return { historyId: null, emailAddress: null }
		}

		var jsonString = Buffer.from(String(encoded), 'base64').toString('utf8')
		var parsed = JSON.parse(jsonString)

		return {
			historyId: parsed && parsed.historyId != null ? String(parsed.historyId) : null,
			emailAddress: parsed && parsed.emailAddress ? String(parsed.emailAddress) : null,
		}
	} catch (error) {
		console.warn('[GmailWebhookService] Failed to parse Pub/Sub payload', {
			message: error && error.message ? error.message : String(error),
		})
		return { historyId: null, emailAddress: null }
	}
}

/**
 * Get a header value from a Gmail message payload.
 * @param {any} message - Gmail message (full).
 * @param {string} headerName - Header name.
 * @returns {string} Header value.
 */
function getHeader(message, headerName) {
	var name = String(headerName || '').toLowerCase()
	var headers = message && message.payload && Array.isArray(message.payload.headers) ? message.payload.headers : []
	for (var i = 0; i < headers.length; i += 1) {
		var h = headers[i]
		if (h && h.name && String(h.name).toLowerCase() === name) {
			return String(h.value || '')
		}
	}
	return ''
}

/**
 * Extract the email address portion from a header like: Name <email@domain>.
 * @param {string} headerValue - Header value.
 * @returns {string} Email or original.
 */
function extractEmail(headerValue) {
	var v = String(headerValue || '').trim()
	var m = v.match(/<([^>]+)>/)
	return m && m[1] ? String(m[1]).trim() : v
}

/**
 * Create a stable short request id from mongo ObjectId.
 * @param {any} bookingId - Mongo ObjectId.
 * @returns {string} Short id.
 */
function shortRequestId(bookingId) {
	var s = String(bookingId || '')
	if (!s) return ''
	return s.slice(-6).toUpperCase()
}

/**
 * Gmail webhook processing service.
 */
class GmailWebhookService {
	/**
	 * Process a Pub/Sub Gmail push notification.
	 * @param {any} pubsubData - Notification payload.
	 * @returns {Promise<object[]>} Results.
	 */
	async processNotification(pubsubData) {
		try {
			if (!gmail) {
				throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
			}

			var parsed = parsePubsubData(pubsubData)
			var historyId = parsed.historyId
			var emailAddress = parsed.emailAddress

			console.info('[GmailWebhookService] Notification received', {
				historyId: historyId,
				emailAddress: emailAddress,
			})

			if (!historyId) {
				return []
			}

			var history = await this.fetchHistory(historyId)

			var results = []
			for (var i = 0; i < history.length; i += 1) {
				var item = history[i]
				var added = item && Array.isArray(item.messagesAdded) ? item.messagesAdded : []
				for (var j = 0; j < added.length; j += 1) {
					var msg = added[j] && added[j].message ? added[j].message : null
					if (!msg || !msg.id) continue

					var r = await this.processMessage(String(msg.id))
					results.push(r)
				}
			}

			return results
		} catch (error) {
			console.error('[GmailWebhookService] processNotification failed', {
				message: error && error.message ? error.message : String(error),
			})
			throw error
		}
	}

	/**
	 * Fetch Gmail history entries since the given history id.
	 * @param {string} startHistoryId - Starting history id.
	 * @returns {Promise<any[]>} History array.
	 */
	async fetchHistory(startHistoryId) {
		try {
			if (!gmail) {
				throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
			}

			if (!startHistoryId) {
				return []
			}

			var all = []
			var pageToken = null

			do {
				var res = await gmail.users.history.list({
					userId: 'me',
					startHistoryId: String(startHistoryId),
					historyTypes: ['messageAdded'],
					...(pageToken ? { pageToken: pageToken } : {}),
				})

				var data = (res && res.data) || {}
				var history = Array.isArray(data.history) ? data.history : []
				all = all.concat(history)
				pageToken = data.nextPageToken || null
			} while (pageToken)

			return all
		} catch (error) {
			console.error('[GmailWebhookService] fetchHistory failed', {
				message: error && error.message ? error.message : String(error),
				startHistoryId: startHistoryId,
			})
			return []
		}
	}

	/**
	 * Process a single Gmail message id.
	 * @param {string} messageId - Gmail message id.
	 * @returns {Promise<object>} Result.
	 */
	async processMessage(messageId) {
		try {
			if (!gmail) {
				throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
			}
			if (!messageId) {
				throw new Error('messageId is required')
			}

			var BookingRequest = (await import('../../models/BookingRequest.js')).default

			var existing = await BookingRequest.findOne({ emailMessageId: String(messageId) })
			if (existing) {
				return { messageId: String(messageId), status: 'duplicate', bookingId: String(existing._id) }
			}

			var msgRes = await gmail.users.messages.get({
				userId: 'me',
				id: String(messageId),
				format: 'full',
			})

			var fullMessage = msgRes && msgRes.data ? msgRes.data : null
			if (!fullMessage) {
				return { messageId: String(messageId), status: 'skipped', reason: 'message_not_found' }
			}

			if (!this.isBookingRequest(fullMessage)) {
				return { messageId: String(messageId), status: 'skipped', reason: 'not_booking_request' }
			}

			var EmailProcessor = (await import('../email/emailProcessor.js')).default
			var processor = new EmailProcessor()
			var parsed = await processor.parse(fullMessage)

			var fromEmail = parsed && parsed.from ? String(parsed.from) : extractEmail(getHeader(fullMessage, 'From'))
			var requesterName = parsed && parsed.name ? String(parsed.name) : ''
			if (!requesterName) {
				requesterName = fromEmail ? fromEmail.split('@')[0] : 'Requester'
			}

			var subject = parsed && parsed.subject ? String(parsed.subject) : getHeader(fullMessage, 'Subject')
			var toHeader = getHeader(fullMessage, 'To')
			var receivedAt = parsed && parsed.date ? new Date(parsed.date) : new Date()
			if (Number.isNaN(receivedAt.getTime())) {
				receivedAt = new Date()
			}

			var booking = new BookingRequest({
				emailMessageId: String(messageId),
				emailThreadId: fullMessage.threadId ? String(fullMessage.threadId) : String(messageId),
				requesterEmail: fromEmail,
				requesterName: requesterName,
				subject: subject,
				rawEmailContent: parsed && parsed.text ? String(parsed.text) : '',
				extractedDetails: parsed && parsed.extractedDetails ? parsed.extractedDetails : {},
				status: 'pending',
				receivedAt: receivedAt,
			})

			await booking.save()

			var EmailLog = (await import('../../models/EmailLog.js')).default
			await EmailLog.create({
				messageId: String(messageId),
				direction: 'incoming',
				from: fromEmail,
				to: extractEmail(toHeader),
				subject: subject,
				bookingRequestId: booking._id,
				receivedAt: receivedAt,
				processingStatus: 'parsed',
				provider: 'gmail_api',
				providerDetails: {},
				gmailData: {
					historyId: fullMessage.historyId != null ? String(fullMessage.historyId) : undefined,
					threadId: fullMessage.threadId ? String(fullMessage.threadId) : undefined,
					labelIds: Array.isArray(fullMessage.labelIds) ? fullMessage.labelIds : undefined,
				},
			})

			await this.queueAutoResponse(booking)
			await this.labelMessage(String(messageId), ['booking-request', 'pending'])

			return { messageId: String(messageId), status: 'processed', bookingId: String(booking._id) }
		} catch (error) {
			console.error('[GmailWebhookService] processMessage failed', {
				message: error && error.message ? error.message : String(error),
				messageId: messageId,
			})
			throw error
		}
	}

	/**
	 * Determine if a message is likely a booking request.
	 * @param {any} emailData - Gmail message.
	 * @returns {boolean} True if likely booking request.
	 */
	isBookingRequest(emailData) {
		try {
			var subject = getHeader(emailData, 'Subject')
			var from = getHeader(emailData, 'From')

			var sender = process.env.GOOGLE_SENDER_EMAIL
			if (sender && from && String(from).toLowerCase().indexOf(String(sender).toLowerCase()) !== -1) {
				return false
			}

			var s = String(subject || '').toLowerCase()
			var keywords = ['booking', 'venue', 'hall', 'lab', 'reservation', 'request', 'event']

			for (var i = 0; i < keywords.length; i += 1) {
				if (s.indexOf(keywords[i]) !== -1) {
					return true
				}
			}

			return false
		} catch {
			return false
		}
	}

	/**
	 * Queue an auto-response email and update booking status.
	 * @param {any} booking - BookingRequest document.
	 * @returns {Promise<void>} Nothing.
	 */
	async queueAutoResponse(booking) {
		try {
			var OutboxService = (await import('../email/outboxService.js')).default

			var formUrl = this.generatePrefilledFormUrl(booking)
			var requestId = shortRequestId(booking && booking._id)

			var templateData = {
				name: booking && booking.requesterName ? String(booking.requesterName) : 'Requester',
				formUrl: formUrl,
				requestId: requestId,
				threadId: booking && booking.emailThreadId ? String(booking.emailThreadId) : undefined,
			}

			var originalSubject = booking && booking.subject ? String(booking.subject) : 'Booking Request'
			var subject = 'Re: ' + originalSubject + ' - Action Required: Complete Booking Form'

			await OutboxService.queueEmail({
				to: booking.requesterEmail,
				subject: subject,
				templateName: 'auto-response',
				templateData: templateData,
				bookingRequestId: booking._id,
			})

			booking.status = 'form_sent'
			await booking.save()
		} catch (error) {
			console.error('[GmailWebhookService] queueAutoResponse failed', {
				message: error && error.message ? error.message : String(error),
				bookingId: booking && booking._id ? String(booking._id) : null,
			})
			throw error
		}
	}

	/**
	 * Generate a prefilled Google Form URL for the booking.
	 *
	 * Uses env mapping for entry field ids:
	 * - GOOGLE_FORM_ENTRY_REQUESTER_EMAIL
	 * - GOOGLE_FORM_ENTRY_REQUESTER_NAME
	 * - GOOGLE_FORM_ENTRY_DEPARTMENT
	 * - GOOGLE_FORM_ENTRY_BOOKING_ID
	 * - GOOGLE_FORM_ENTRY_VENUE_REQUESTED
	 *
	 * @param {any} booking - BookingRequest.
	 * @returns {string} URL.
	 */
	generatePrefilledFormUrl(booking) {
		try {
			var formId = process.env.GOOGLE_FORM_ID
			if (!formId) {
				throw new Error('Missing env var GOOGLE_FORM_ID')
			}

			var baseUrl = 'https://docs.google.com/forms/d/e/' + String(formId) + '/viewform'
			var url = new URL(baseUrl)
			url.searchParams.set('usp', 'pp_url')

			var emailEntry = process.env.GOOGLE_FORM_ENTRY_REQUESTER_EMAIL
			var nameEntry = process.env.GOOGLE_FORM_ENTRY_REQUESTER_NAME
			var deptEntry = process.env.GOOGLE_FORM_ENTRY_DEPARTMENT
			var bookingIdEntry = process.env.GOOGLE_FORM_ENTRY_BOOKING_ID
			var venueEntry = process.env.GOOGLE_FORM_ENTRY_VENUE_REQUESTED

			if (emailEntry) url.searchParams.set('entry.' + String(emailEntry), String(booking.requesterEmail || ''))
			if (nameEntry) url.searchParams.set('entry.' + String(nameEntry), String(booking.requesterName || ''))
			if (deptEntry) {
				var dept = booking && booking.extractedDetails && booking.extractedDetails.department
					? String(booking.extractedDetails.department)
					: ''
				url.searchParams.set('entry.' + String(deptEntry), dept)
			}
			if (bookingIdEntry) url.searchParams.set('entry.' + String(bookingIdEntry), String(booking._id || ''))
			if (venueEntry) {
				var venue = booking && booking.extractedDetails && booking.extractedDetails.venueRequested
					? String(booking.extractedDetails.venueRequested)
					: ''
				url.searchParams.set('entry.' + String(venueEntry), venue)
			}

			return url.toString()
		} catch (error) {
			console.error('[GmailWebhookService] generatePrefilledFormUrl failed', {
				message: error && error.message ? error.message : String(error),
			})
			// Fall back to a non-prefilled form link if possible.
			var fallbackFormId = process.env.GOOGLE_FORM_ID
			return fallbackFormId
				? 'https://docs.google.com/forms/d/e/' + String(fallbackFormId) + '/viewform'
				: ''
		}
	}

	/**
	 * Apply labels to a message. Non-critical: errors are caught and not thrown.
	 * @param {string} messageId - Gmail message id.
	 * @param {string[]} labels - Label names.
	 * @returns {Promise<{success:boolean,labelIds:string[]}>} Result.
	 */
	async labelMessage(messageId, labels) {
		try {
			if (!gmail) {
				return { success: false, labelIds: [] }
			}
			if (!messageId || !Array.isArray(labels) || labels.length === 0) {
				return { success: true, labelIds: [] }
			}

			var listRes = await gmail.users.labels.list({ userId: 'me' })
			var existingLabels = ((listRes && listRes.data) || {}).labels || []

			var byName = {}
			for (var i = 0; i < existingLabels.length; i += 1) {
				var l = existingLabels[i]
				if (l && l.name) {
					byName[String(l.name).toLowerCase()] = l
				}
			}

			var labelIds = []
			for (var j = 0; j < labels.length; j += 1) {
				var labelName = String(labels[j] || '').trim()
				if (!labelName) continue

				var key = labelName.toLowerCase()
				var existing = byName[key]

				if (!existing) {
					var createRes = await gmail.users.labels.create({
						userId: 'me',
						requestBody: {
							name: labelName,
							labelListVisibility: 'labelShow',
							messageListVisibility: 'show',
						},
					})
					existing = createRes && createRes.data ? createRes.data : null
					if (existing && existing.name) {
						byName[String(existing.name).toLowerCase()] = existing
					}
				}

				if (existing && existing.id) {
					labelIds.push(String(existing.id))
				}
			}

			// de-dup
			var unique = {}
			var deduped = []
			for (var k = 0; k < labelIds.length; k += 1) {
				var id = labelIds[k]
				if (id && !unique[id]) {
					unique[id] = true
					deduped.push(id)
				}
			}

			await gmail.users.messages.modify({
				userId: 'me',
				id: String(messageId),
				requestBody: {
					addLabelIds: deduped,
				},
			})

			return { success: true, labelIds: deduped }
		} catch (error) {
			console.warn('[GmailWebhookService] labelMessage failed (non-critical)', {
				message: error && error.message ? error.message : String(error),
				messageId: messageId,
			})
			return { success: false, labelIds: [] }
		}
	}
}

const gmailWebhookService = new GmailWebhookService()

export default gmailWebhookService

