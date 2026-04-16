import { Buffer } from 'node:buffer'

import { gmail } from '../../config/gmail.js'

/**
 * Convert a string to base64url encoding.
 * @param {string} input - Raw string.
 * @returns {string} Base64url-encoded string.
 */
function toBase64Url(input) {
	try {
		return Buffer.from(String(input), 'utf8')
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/g, '')
	} catch (error) {
		error.message = '[GmailSenderService] Failed to base64url encode: ' + error.message
		throw error
	}
}

/**
 * Encode a header value safely for email headers.
 * @param {string} value - Header value.
 * @returns {string} Sanitized value.
 */
function sanitizeHeaderValue(value) {
	// Prevent header injection.
	return String(value || '').replace(/[\r\n]+/g, ' ').trim()
}

/**
 * Build a simple RFC 5322 MIME email message.
 * @param {object} params - Parameters.
 * @param {string} params.to - Recipient email.
 * @param {string} params.subject - Email subject.
 * @param {string=} params.bodyHtml - HTML body.
 * @param {string=} params.bodyText - Plain text body.
 * @param {string=} params.threadId - Gmail thread id (used for threading support).
 * @returns {string} Raw MIME message.
 */
function buildMimeMessage(params) {
	try {
		var to = sanitizeHeaderValue(params && params.to)
		var subject = sanitizeHeaderValue(params && params.subject)
		var bodyHtml = params && params.bodyHtml ? String(params.bodyHtml) : ''
		var bodyText = params && params.bodyText ? String(params.bodyText) : ''
		var threadId = params && params.threadId ? String(params.threadId) : ''

		if (!to) {
			throw new Error('to is required')
		}
		if (!subject) {
			throw new Error('subject is required')
		}

		var headers = []
		headers.push('To: ' + to)
		headers.push('Subject: ' + subject)
		headers.push('MIME-Version: 1.0')

		// NOTE: In-Reply-To/References typically require Message-Id values.
		// The spec here requests using threadId if provided.
		if (threadId) {
			headers.push('In-Reply-To: <' + sanitizeHeaderValue(threadId) + '>')
			headers.push('References: <' + sanitizeHeaderValue(threadId) + '>')
		}

		// If both bodies are present, send multipart/alternative.
		if (bodyHtml && bodyText) {
			var boundary = '----=_Part_' + Date.now() + '_' + Math.random().toString(16).slice(2)
			headers.push('Content-Type: multipart/alternative; boundary="' + boundary + '"')

			var lines = []
			lines.push(headers.join('\r\n'))
			lines.push('')
			lines.push('--' + boundary)
			lines.push('Content-Type: text/plain; charset="UTF-8"')
			lines.push('Content-Transfer-Encoding: 7bit')
			lines.push('')
			lines.push(bodyText)
			lines.push('')
			lines.push('--' + boundary)
			lines.push('Content-Type: text/html; charset="UTF-8"')
			lines.push('Content-Transfer-Encoding: 7bit')
			lines.push('')
			lines.push(bodyHtml)
			lines.push('')
			lines.push('--' + boundary + '--')
			lines.push('')
			return lines.join('\r\n')
		}

		if (bodyHtml) {
			headers.push('Content-Type: text/html; charset="UTF-8"')
			headers.push('Content-Transfer-Encoding: 7bit')
			return headers.join('\r\n') + '\r\n\r\n' + bodyHtml
		}

		// Default to text.
		headers.push('Content-Type: text/plain; charset="UTF-8"')
		headers.push('Content-Transfer-Encoding: 7bit')
		return headers.join('\r\n') + '\r\n\r\n' + bodyText
	} catch (error) {
		error.message = '[GmailSenderService] Failed to build MIME message: ' + error.message
		throw error
	}
}

/**
 * Gmail sender service.
 */
class GmailSenderService {
	/**
	 * Send an email via Gmail API.
	 * @param {object} params - Email parameters.
	 * @param {string} params.to - Recipient email.
	 * @param {string} params.subject - Subject line.
	 * @param {string=} params.bodyHtml - HTML body.
	 * @param {string=} params.bodyText - Plain text body.
	 * @param {string=} params.threadId - Gmail thread id (keeps conversation threaded).
	 * @returns {Promise<{success:boolean, providerMessageId:string, threadId:(string|undefined), labelIds:(string[]|undefined)}>} Result.
	 */
	async sendEmail(params) {
		try {
			if (!gmail) {
				throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
			}

			var mime = buildMimeMessage({
				to: params && params.to,
				subject: params && params.subject,
				bodyHtml: params && params.bodyHtml,
				bodyText: params && params.bodyText,
				threadId: params && params.threadId,
			})

			var raw = toBase64Url(mime)

			var requestBody = { raw: raw }
			if (params && params.threadId) {
				requestBody.threadId = String(params.threadId)
			}

			var res = await gmail.users.messages.send({
				userId: 'me',
				requestBody: requestBody,
			})

			var data = (res && res.data) || {}

			return {
				success: true,
				providerMessageId: data.id,
				threadId: data.threadId,
				labelIds: data.labelIds,
			}
		} catch (error) {
			console.error('[GmailSenderService] sendEmail failed', {
				message: error && error.message ? error.message : String(error),
				to: params && params.to,
				subject: params && params.subject,
			})
			throw error
		}
	}

	/**
	 * Apply labels to a Gmail message. Creates missing labels.
	 * @param {string} messageId - Gmail message id.
	 * @param {string[]} labelNames - Array of label names.
	 * @returns {Promise<{success:boolean, labelIds:string[]}>} Result.
	 */
	async applyLabel(messageId, labelNames) {
		try {
			if (!gmail) {
				throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
			}
			if (!messageId) {
				throw new Error('messageId is required')
			}
			if (!Array.isArray(labelNames)) {
				throw new Error('labelNames must be an array')
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
			for (var j = 0; j < labelNames.length; j += 1) {
				var labelNameRaw = labelNames[j]
				if (!labelNameRaw) {
					continue
				}
				var labelName = String(labelNameRaw).trim()
				if (!labelName) {
					continue
				}

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

			// De-duplicate label ids.
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
			console.error('[GmailSenderService] applyLabel failed', {
				message: error && error.message ? error.message : String(error),
				messageId: messageId,
				labelNames: labelNames,
			})
			throw error
		}
	}
}

const gmailSenderService = new GmailSenderService()

export default gmailSenderService

