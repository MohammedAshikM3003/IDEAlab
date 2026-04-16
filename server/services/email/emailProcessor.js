import { Buffer } from 'node:buffer'

/**
 * Decode Gmail API base64 (base64url) payload data.
 * @param {string} data - base64 or base64url encoded data.
 * @returns {string} Decoded UTF-8 string.
 */
function decodeGmailBase64(data) {
	try {
		if (!data) return ''

		const normalized = String(data).replace(/-/g, '+').replace(/_/g, '/')
		const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
		return Buffer.from(padded, 'base64').toString('utf8')
	} catch {
		return ''
	}
}

/**
 * Extract a simple email address from a header value.
 * @param {string} header - Header value.
 * @returns {string} Extracted email or original string.
 */
function extractEmailAddress(header) {
	const value = String(header || '').trim()
	const match = value.match(/<([^>]+)>/)
	return match ? String(match[1]).trim() : value
}

/**
 * Email processor responsible for parsing Gmail messages.
 */
class EmailProcessor {
	/**
	 * Parse a Gmail API message object.
	 * @param {object} gmailMessage - Gmail API message.
	 * @returns {Promise<{from:string,to:string,subject:string,date:string,name:string,text:string,html:(string|null),extractedDetails:object}>} Parsed email.
	 */
	async parse(gmailMessage) {
		try {
			const payload = gmailMessage && gmailMessage.payload ? gmailMessage.payload : null
			const headersArray = payload && Array.isArray(payload.headers) ? payload.headers : []

			/** @type {Record<string,string>} */
			const headers = {}
			for (const h of headersArray) {
				if (!h || !h.name) continue
				headers[String(h.name).toLowerCase()] = String(h.value || '')
			}

			const body = this.extractBody(payload)
			const rawEmail = this.buildRawEmail(headers, body)

			let simpleParser
			try {
				// Lazy-load to avoid crashing if dependency isn't installed yet.
				const mailparser = await import('mailparser')
				simpleParser = mailparser.simpleParser
			} catch (error) {
				throw new Error(
					`Missing dependency 'mailparser'. Install it with: npm i mailparser. Details: ${error?.message || String(error)}`,
				)
			}

			const parsed = await simpleParser(rawEmail)
			const fromHeader = headers.from || ''
			const toHeader = headers.to || ''
			const subject = headers.subject || ''
			const date = headers.date || ''

			const name = this.extractName(fromHeader)

			const text = parsed && parsed.text ? String(parsed.text) : ''
			const html = parsed && parsed.html ? String(parsed.html) : null
			const contentForExtraction = text || body || (html || '')

			return {
				from: extractEmailAddress(fromHeader),
				to: extractEmailAddress(toHeader),
				subject,
				date,
				name,
				text,
				html,
				extractedDetails: this.extractBookingDetails(contentForExtraction),
			}
		} catch (error) {
			error.message = `EmailProcessor.parse failed: ${error.message}`
			throw error
		}
	}

	/**
	 * Extract body content from a Gmail payload recursively.
	 * Prioritizes text/plain over text/html.
	 * @param {object|null} payload - Gmail message payload.
	 * @returns {string} Body content.
	 */
	extractBody(payload) {
		try {
			if (!payload) return ''

			// Direct body data.
			if (payload.body && payload.body.data) {
				return decodeGmailBase64(payload.body.data)
			}

			const parts = Array.isArray(payload.parts) ? payload.parts : []
			if (parts.length === 0) return ''

			let plain = ''
			let html = ''

			for (const part of parts) {
				if (!part) continue
				const mimeType = String(part.mimeType || '').toLowerCase()

				if (mimeType === 'text/plain' && part.body && part.body.data) {
					const decoded = decodeGmailBase64(part.body.data)
					if (decoded) {
						plain = decoded
					}
				} else if (mimeType === 'text/html' && part.body && part.body.data) {
					const decoded = decodeGmailBase64(part.body.data)
					if (decoded && !html) {
						html = decoded
					}
				} else if (Array.isArray(part.parts) && part.parts.length > 0) {
					const nested = this.extractBody(part)
					if (nested && !plain && !html) {
						// Keep as a fallback if we don't find explicit text/plain or text/html.
						plain = nested
					}
				}

				// If we found plain text, that's our priority.
				if (plain) {
					return plain
				}
			}

			return plain || html || ''
		} catch {
			// Be resilient; parsing should not crash on malformed payloads.
			return ''
		}
	}

	/**
	 * Build a raw email string using selected headers.
	 * @param {Record<string,string>} headers - Lowercased header map.
	 * @param {string} body - Body content.
	 * @returns {string} Raw email.
	 */
	buildRawEmail(headers, body) {
		try {
			const from = String(headers?.from || '')
			const to = String(headers?.to || '')
			const subject = String(headers?.subject || '')
			const date = String(headers?.date || '')

			const lines = []
			if (from) lines.push(`From: ${from}`)
			if (to) lines.push(`To: ${to}`)
			if (subject) lines.push(`Subject: ${subject}`)
			if (date) lines.push(`Date: ${date}`)
			lines.push('')
			lines.push(String(body || ''))

			return lines.join('\r\n')
		} catch {
			return String(body || '')
		}
	}

	/**
	 * Extract a display name from a From header.
	 * @param {string} fromHeader - From header value.
	 * @returns {string} Name.
	 */
	extractName(fromHeader) {
		try {
			const value = String(fromHeader || '').trim()
			const match = value.match(/^\s*"?([^"<]+?)"?\s*<[^>]+>\s*$/)
			if (match && match[1]) {
				return String(match[1]).trim()
			}
			return value
		} catch {
			return String(fromHeader || '')
		}
	}

	/**
	 * Extract booking-related details from email content.
	 * @param {string} content - Email text or html.
	 * @returns {{requestedDate?:string, venueRequested?:string, department?:string, eventPurpose?:string, supervisor?:string}} Extracted details.
	 */
	extractBookingDetails(content) {
		try {
			const text = String(content || '')

			/** @type {{requestedDate?:string, venueRequested?:string, department?:string, eventPurpose?:string, supervisor?:string}} */
			const details = {}

			// Date: look for "date:" or "on" followed by a date-like string.
			const dateMatch = text.match(/(?:\bdate\s*:\s*|\bon\s+)([A-Za-z0-9,\-/ ]{4,30})/i)
			if (dateMatch && dateMatch[1]) {
				details.requestedDate = String(dateMatch[1]).trim()
			}

			// Venue: venue/hall/lab/room.
			const venueMatch = text.match(/\b(?:venue|hall|lab|room)\s*:\s*([^\n\r]{2,120})/i)
			if (venueMatch && venueMatch[1]) {
				details.venueRequested = String(venueMatch[1]).trim()
			}

			// Department.
			const deptMatch = text.match(/\b(?:department|dept|branch)\s*:\s*([^\n\r]{2,120})/i)
			if (deptMatch && deptMatch[1]) {
				details.department = String(deptMatch[1]).trim()
			}

			// Event purpose.
			const purposeMatch = text.match(/\b(?:purpose|event|reason)\s*:\s*([^\n\r]{2,200})/i)
			if (purposeMatch && purposeMatch[1]) {
				details.eventPurpose = String(purposeMatch[1]).trim()
			}

			// Supervisor (optional but supported by BookingRequest schema).
			const supervisorMatch = text.match(/\bsupervisor\s*:\s*([^\n\r]{2,120})/i)
			if (supervisorMatch && supervisorMatch[1]) {
				details.supervisor = String(supervisorMatch[1]).trim()
			}

			return details
		} catch {
			return {}
		}
	}
}

export default EmailProcessor

