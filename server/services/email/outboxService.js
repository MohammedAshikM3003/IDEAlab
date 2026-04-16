import Outbox from '../../models/Outbox.js'
import templateEngine from './templateEngine.js'
import gmailSenderService from '../gmail/gmailSenderService.js'

/**
 * Compute exponential backoff delay in minutes.
 * Uses $2^{attemptCount}$ minutes.
 * @param {number} attemptCount - Attempt count (1-based typical after increment).
 * @returns {number} Delay in minutes.
 */
function getBackoffMinutes(attemptCount) {
	try {
		const n = Number.isFinite(attemptCount) ? attemptCount : 0
		const clamped = Math.max(0, Math.min(20, n))
		return Math.pow(2, clamped)
	} catch {
		return 2
	}
}

/**
 * Determine if the outbox entry should retry.
 * @param {object} entry - Outbox document.
 * @returns {boolean} True if should retry.
 */
function shouldRetry(entry) {
	const attemptCount = Number(entry?.attemptCount || 0)
	const maxAttempts = Number(entry?.maxAttempts || 5)
	return attemptCount < maxAttempts
}

/**
 * Normalize an error into safe fields for storage.
 * @param {unknown} error - Error-like.
 * @returns {{message: string, stack: string}} Normalized error.
 */
function normalizeError(error) {
	const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error)
	const stack = error && typeof error === 'object' && 'stack' in error ? String(error.stack) : ''
	return { message, stack }
}

/**
 * OutboxService manages the email retry queue.
 */
class OutboxService {
	/**
	 * Queue an email by creating an Outbox document.
	 * @param {object} emailData - Data for the email.
	 * @param {string} emailData.to - Recipient.
	 * @param {string} emailData.subject - Subject.
	 * @param {string=} emailData.bodyHtml - HTML body.
	 * @param {string=} emailData.bodyText - Text body.
	 * @param {string=} emailData.templateName - Template name.
	 * @param {object=} emailData.templateData - Template variables.
	 * @param {string=} emailData.bookingRequestId - BookingRequest id.
	 * @param {Date=} emailData.scheduledAt - When to send.
	 * @param {number=} emailData.maxAttempts - Maximum attempts.
	 * @returns {Promise<any>} Created Outbox document.
	 */
	async queueEmail(emailData) {
		try {
			const payload = emailData || {}

			const outbox = new Outbox({
				to: payload.to,
				subject: payload.subject,
				bodyHtml: payload.bodyHtml,
				bodyText: payload.bodyText,
				templateName: payload.templateName,
				templateData: payload.templateData,
				bookingRequestId: payload.bookingRequestId,
				scheduledAt: payload.scheduledAt || new Date(),
				maxAttempts: typeof payload.maxAttempts === 'number' ? payload.maxAttempts : undefined,
			})

			await outbox.save()
			return outbox
		} catch (error) {
			error.message = `OutboxService.queueEmail failed: ${error.message}`
			throw error
		}
	}

	/**
	 * Process queued outbox emails.
	 * @param {number} batchSize - Max messages to process.
	 * @returns {Promise<object[]>} Array of processing results.
	 */
	async processOutbox(batchSize = 10) {
		try {
			const now = new Date()
			const limit = Number.isFinite(batchSize) ? Math.max(1, Math.min(100, batchSize)) : 10

			const query = {
				$and: [
					{
						$or: [
							{ status: 'pending', scheduledAt: { $lte: now } },
							{ status: 'failed', nextAttemptAt: { $lte: now } },
						],
					},
					{ attemptCount: { $lt: 5 } },
				],
			}

			const entries = await Outbox.find(query)
				.sort({ scheduledAt: 1, nextAttemptAt: 1, createdAt: 1 })
				.limit(limit)

			const results = []
			for (const entry of entries) {
				// Process sequentially to avoid Gmail rate spikes.
				// If you need parallelism later, add controlled concurrency.
				const result = await this.sendEmail(entry)
				results.push(result)
			}

			return results
		} catch (error) {
			error.message = `OutboxService.processOutbox failed: ${error.message}`
			throw error
		}
	}

	/**
	 * Send one outbox entry.
	 * @param {any} outboxEntry - Outbox document or id.
	 * @returns {Promise<object>} Result object.
	 */
	async sendEmail(outboxEntry) {
		const outboxId = outboxEntry?._id ? String(outboxEntry._id) : String(outboxEntry)

		try {
			if (!outboxId || outboxId === 'undefined' || outboxId === 'null') {
				throw new Error('outboxEntry is required')
			}

			const now = new Date()

			// Claim/mark as processing and increment attemptCount in one operation.
			const claimed = await Outbox.findOneAndUpdate(
				{ _id: outboxId, status: { $in: ['pending', 'failed'] } },
				{
					$set: { status: 'processing', lastAttemptAt: now },
					$inc: { attemptCount: 1 },
				},
				{ new: true },
			)

			if (!claimed) {
				return { success: false, outboxId, error: 'Outbox entry not available for processing', willRetry: false }
			}

			let bodyHtml = claimed.bodyHtml
			let bodyText = claimed.bodyText

			if ((!bodyHtml || String(bodyHtml).trim() === '') && claimed.templateName) {
				const html = await templateEngine.render(String(claimed.templateName), claimed.templateData || {})
				bodyHtml = html
			}

			const threadId = claimed?.templateData?.threadId ? String(claimed.templateData.threadId) : undefined

			const sendRes = await gmailSenderService.sendEmail({
				to: claimed.to,
				subject: claimed.subject,
				bodyHtml,
				bodyText,
				threadId,
			})

			await Outbox.findByIdAndUpdate(outboxId, {
				$set: {
					status: 'sent',
					sentAt: new Date(),
					providerMessageId: sendRes && sendRes.providerMessageId ? String(sendRes.providerMessageId) : undefined,
					nextAttemptAt: null,
					lastError: null,
				},
			})

			return {
				success: true,
				outboxId,
				providerMessageId: sendRes && sendRes.providerMessageId ? String(sendRes.providerMessageId) : undefined,
			}
		} catch (error) {
			const normalized = normalizeError(error)

			try {
				const current = await Outbox.findById(outboxId)
				if (!current) {
					return { success: false, outboxId, error: normalized.message, willRetry: false }
				}

				const willRetry = shouldRetry(current)
				const backoffMinutes = getBackoffMinutes(current.attemptCount)
				const nextAttemptAt = willRetry ? new Date(Date.now() + backoffMinutes * 60 * 1000) : null

				await Outbox.findByIdAndUpdate(outboxId, {
					$set: {
						status: 'failed',
						lastError: normalized.message,
						nextAttemptAt,
					},
					$push: {
						errorHistory: {
							timestamp: new Date(),
							error: normalized.message,
							stack: normalized.stack,
						},
					},
				})

				return {
					success: false,
					outboxId,
					error: normalized.message,
					willRetry,
					nextAttemptAt,
				}
			} catch (secondaryError) {
				const secondary = normalizeError(secondaryError)
				return {
					success: false,
					outboxId,
					error: normalized.message,
					willRetry: false,
					nextAttemptAt: null,
					persistenceError: secondary.message,
				}
			}
		}
	}
}

const outboxService = new OutboxService()

export default outboxService

