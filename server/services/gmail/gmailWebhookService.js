import process from 'node:process'
import crypto from 'node:crypto'
import { Buffer } from 'node:buffer'

import { gmail } from '../../config/gmail.js'
import Setting from '../../models/Setting.js'
import BookingFormToken from '../../models/BookingFormToken.js'

function getGmailClient() {
	return gmail
}

let lastProcessedHistoryId = null
const processedMessageIds = new Set()

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
		console.log('[GmailWebhookService] parsePubsubData error', {
			message: error && error.message ? error.message : String(error),
			stack: error && error.stack ? error.stack : null,
		})
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
 * Detect Gmail historyId too old errors.
 * @param {any} error - Error-like.
 * @returns {boolean} True if historyId is too old.
 */
function isHistoryIdTooOldError(error) {
	var status = error && (error.code || (error.response && error.response.status))
	var message = error && (error.message || (error.response && error.response.data && error.response.data.error && error.response.data.error.message))

	if (Number(status) !== 400) return false
	if (!message) return false

	var msg = String(message).toLowerCase()
	return msg.indexOf('historyid') !== -1 && msg.indexOf('too old') !== -1
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

			var startHistoryId = null
			if (lastProcessedHistoryId) {
				startHistoryId = String(lastProcessedHistoryId)
			} else {
				var incomingNumber = Number.parseInt(String(historyId || ''), 10)
				if (Number.isFinite(incomingNumber)) {
					startHistoryId = String(Math.max(1, incomingNumber - 1))
				}
			}

			console.log('[GmailWebhookService] Using startHistoryId', {
				incomingHistoryId: historyId,
				startHistoryId: startHistoryId,
				lastProcessedHistoryId: lastProcessedHistoryId,
			})

			var history = await this.fetchHistory(startHistoryId || historyId)
			lastProcessedHistoryId = historyId
			console.log('[GmailWebhookService] History items count', {
				count: Array.isArray(history) ? history.length : 0,
			})

			var results = []

			if (!history || history.length === 0) {
				console.log('[GmailWebhookService] History empty, falling back to recent unread inbox messages')

				var listRes = await gmail.users.messages.list({
					userId: 'me',
					maxResults: 5,
					q: 'is:unread in:inbox',
				})

				var listData = (listRes && listRes.data) || {}
				var listMessages = Array.isArray(listData.messages) ? listData.messages : []

				console.log('[GmailWebhookService] Fallback list result', {
					count: listMessages.length,
				})

				var nowMs = Date.now()
				var cutoffMs = nowMs - 10 * 60 * 1000

				for (var f = 0; f < listMessages.length; f += 1) {
					var listMsg = listMessages[f]
					if (!listMsg || !listMsg.id) {
						continue
					}

					if (processedMessageIds.has(String(listMsg.id))) {
						console.log('[GmailWebhookService] Fallback skipping already processed message', {
							messageId: String(listMsg.id),
						})
						continue
					}

					console.log('[GmailWebhookService] Fallback fetching message', {
						messageId: String(listMsg.id),
					})

					var fullRes = await gmail.users.messages.get({
						userId: 'me',
						id: String(listMsg.id),
						format: 'full',
					})

					var fullMessage = fullRes && fullRes.data ? fullRes.data : null
					if (!fullMessage) {
						console.log('[GmailWebhookService] Fallback message missing data', {
							messageId: String(listMsg.id),
						})
						continue
					}

					var internalDateMs = Number(fullMessage.internalDate)
					var withinWindow = Number.isFinite(internalDateMs) ? internalDateMs >= cutoffMs : false

					console.log('[GmailWebhookService] Fallback message timing', {
						messageId: String(listMsg.id),
						internalDate: fullMessage.internalDate,
						withinLast10Minutes: withinWindow,
					})

					if (!withinWindow) {
						continue
					}

					var isBooking = this.isBookingRequest(fullMessage)
					console.log('[GmailWebhookService] Fallback booking check', {
						messageId: String(listMsg.id),
						isBookingRequest: isBooking,
					})

					if (isBooking) {
						var fallbackResult = await this.processMessage(String(listMsg.id))
						results.push(fallbackResult)
						processedMessageIds.add(String(listMsg.id))
					}
				}

				return results
			}
			for (var i = 0; i < history.length; i += 1) {
				var item = history[i]
				var added = item && Array.isArray(item.messagesAdded) ? item.messagesAdded : []
				for (var j = 0; j < added.length; j += 1) {
					var msg = added[j] && added[j].message ? added[j].message : null
					if (!msg || !msg.id) continue

					console.log('[GmailWebhookService] Processing message', {
						messageId: String(msg.id),
					})

					var r = await this.processMessage(String(msg.id))
					results.push(r)
					processedMessageIds.add(String(msg.id))
				}
			}

			return results
		} catch (error) {
			console.log('[GmailWebhookService] processNotification error', {
				message: error && error.message ? error.message : String(error),
				stack: error && error.stack ? error.stack : null,
			})
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
			var latestHistoryId = null

			do {
				var res = await gmail.users.history.list({
					userId: 'me',
					startHistoryId: String(startHistoryId),
					historyTypes: ['messageAdded'],
					...(pageToken ? { pageToken: pageToken } : {}),
				})

				console.log('[GmailWebhookService] history.list raw response', {
					data: res && res.data ? res.data : res,
				})

				var data = (res && res.data) || {}
				if (data && data.historyId) {
					latestHistoryId = String(data.historyId)
				}
				var history = Array.isArray(data.history) ? data.history : []
				console.log('[GmailWebhookService] history.list history count', {
					count: history.length,
				})
				all = all.concat(history)
				pageToken = data.nextPageToken || null
			} while (pageToken)

			if (latestHistoryId) {
				try {
					await Setting.setLastGmailHistoryId(latestHistoryId)
				} catch (error) {
					console.warn('[GmailWebhookService] Failed to store historyId', {
						message: error && error.message ? error.message : String(error),
						historyId: latestHistoryId,
					})
				}
			}

			return all
		} catch (error) {
			console.log('[GmailWebhookService] fetchHistory error', {
				message: error && error.message ? error.message : String(error),
				stack: error && error.stack ? error.stack : null,
			})
			if (isHistoryIdTooOldError(error)) {
				try {
					var watchHistoryId = await Setting.getLastGmailWatchHistoryId()
					if (watchHistoryId) {
						await Setting.setLastGmailHistoryId(watchHistoryId)
						console.warn('[GmailWebhookService] historyId too old, resetting to watch historyId', {
							startHistoryId: startHistoryId,
							watchHistoryId: watchHistoryId,
						})
						return []
					}
				} catch (secondaryError) {
					console.log('[GmailWebhookService] reset historyId error', {
						message: secondaryError && secondaryError.message ? secondaryError.message : String(secondaryError),
						stack: secondaryError && secondaryError.stack ? secondaryError.stack : null,
					})
					console.warn('[GmailWebhookService] Failed to reset historyId after too-old error', {
						message: secondaryError && secondaryError.message ? secondaryError.message : String(secondaryError),
					})
				}
			}

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
				console.log('[GmailWebhookService] Duplicate skipped', {
					messageId: String(messageId),
					bookingId: String(existing._id),
				})
				await this.markAsRead(String(messageId))
				processedMessageIds.add(String(messageId))
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

			console.log('[GmailWebhookService] Full message fetched', {
				messageId: String(messageId),
				subject: getHeader(fullMessage, 'Subject'),
				from: getHeader(fullMessage, 'From'),
			})

			if (!this.isBookingRequest(fullMessage)) {
				return { messageId: String(messageId), status: 'skipped', reason: 'not_booking_request' }
			}

			var EmailProcessor = (await import('../email/emailProcessor.js')).default
			var processor = new EmailProcessor()
			var parsed = await processor.parse(fullMessage)

			console.log('[GmailWebhookService] Email parsed', {
				requesterEmail: parsed && parsed.from ? String(parsed.from) : null,
				requesterName: parsed && parsed.name ? String(parsed.name) : null,
			})

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

			console.log('[GmailWebhookService] BookingRequest to save', {
				booking: booking && typeof booking.toObject === 'function' ? booking.toObject() : booking,
			})

			await booking.save()
			await this.markAsRead(String(messageId))

			var requestId = shortRequestId(booking && booking._id)
			var token = crypto.randomBytes(32).toString('hex')
			var expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

			await new BookingFormToken({
				token: token,
				bookingRequestId: booking._id,
				refCode: requestId,
				status: 'active',
				expiresAt: expiresAt,
			}).save()

			var bookingUrl =
				(process.env.FRONTEND_URL || 'http://localhost:5173') +
				'/booking-form?token=' +
				token

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

			await this.queueAutoResponse(booking, bookingUrl)
			await this.labelMessage(String(messageId), ['booking-request', 'pending'])

			processedMessageIds.add(String(messageId))
			return { messageId: String(messageId), status: 'processed', bookingId: String(booking._id) }
		} catch (error) {
			console.log('[GmailWebhookService] processMessage error', {
				message: error && error.message ? error.message : String(error),
				stack: error && error.stack ? error.stack : null,
			})
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
			var senderLower = sender ? String(sender).toLowerCase() : ''
			var fromLower = from ? String(from).toLowerCase() : ''
			var subjectText = String(subject || '').trim()

			if (subjectText && subjectText.toLowerCase().startsWith('re:')) {
				console.log('[GmailWebhookService] Skipping reply email', { subject: subject })
				return false
			}

			if (fromLower.indexOf('ksridealab@gmail.com') !== -1 || (senderLower && fromLower.indexOf(senderLower) !== -1)) {
				if (subjectText.toLowerCase().startsWith('re:')) {
					console.log('[GmailWebhookService] Skipping reply email from self', {
						from: from,
						subject: subject,
					})
				} else {
					console.log('[GmailWebhookService] Skipping auto-response email from self', { from: from })
				}
				return false
			}

			console.log('[GmailWebhookService] isBookingRequest subject', {
				subject: subject,
			})

			var s = String(subject || '').toLowerCase()
			var keywords = ['booking', 'venue', 'hall', 'lab', 'reservation', 'request', 'event']

			for (var i = 0; i < keywords.length; i += 1) {
				if (s.indexOf(keywords[i]) !== -1) {
					console.log('[GmailWebhookService] isBookingRequest match', {
						subject: subject,
						matchedKeyword: keywords[i],
					})
					return true
				}
			}

			console.log('[GmailWebhookService] isBookingRequest no match', {
				subject: subject,
			})

			return false
		} catch (error) {
			console.log('[GmailWebhookService] isBookingRequest error', {
				message: error && error.message ? error.message : String(error),
				stack: error && error.stack ? error.stack : null,
			})
			return false
		}
	}

	async markAsRead(messageId) {
		try {
			const gmail = getGmailClient()
			if (!gmail) return
			await gmail.users.messages.modify({
				userId: 'me',
				id: messageId,
				requestBody: {
					removeLabelIds: ['UNREAD'],
				},
			})
			console.log('[GmailWebhookService] Marked as read', { messageId })
		} catch (err) {
			console.warn('[GmailWebhookService] Failed to mark as read', { messageId, error: err.message })
		}
	}

	/**
	 * Queue an auto-response email and update booking status.
	 * @param {any} booking - BookingRequest document.
	 * @returns {Promise<void>} Nothing.
	 */
	async queueAutoResponse(booking, bookingUrl) {
		try {
			var OutboxService = (await import('../email/outboxService.js')).default
			var requestId = shortRequestId(booking && booking._id)

			var templateData = {
				name: booking && booking.requesterName ? String(booking.requesterName) : 'Requester',
				requestId: requestId,
				bookingUrl: bookingUrl,
				threadId: booking && booking.emailThreadId ? String(booking.emailThreadId) : undefined,
			}

			var originalSubject = booking && booking.subject ? String(booking.subject) : 'Booking Request'
			var subject = 'Re: ' + originalSubject + ' - Next steps coming soon'

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
			console.log('[GmailWebhookService] queueAutoResponse error', {
				message: error && error.message ? error.message : String(error),
				stack: error && error.stack ? error.stack : null,
			})
			console.error('[GmailWebhookService] queueAutoResponse failed', {
				message: error && error.message ? error.message : String(error),
				bookingId: booking && booking._id ? String(booking._id) : null,
			})
			throw error
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
			console.log('[GmailWebhookService] labelMessage error', {
				message: error && error.message ? error.message : String(error),
				stack: error && error.stack ? error.stack : null,
			})
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

