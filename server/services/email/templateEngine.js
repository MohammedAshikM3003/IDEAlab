/** @type {any|null} */
let Handlebars = null

/**
 * Lazy-load handlebars so server startup doesn't fail if deps are installed later.
 * @returns {Promise<any>} Handlebars module.
 */
async function getHandlebars() {
	if (Handlebars) {
		return Handlebars
	}

	try {
		const mod = await import('handlebars')
		Handlebars = mod && mod.default ? mod.default : mod
		return Handlebars
	} catch {
		throw new Error("Missing dependency 'handlebars'. Install it with: npm i handlebars")
	}
}

/**
 * Lightweight email template engine.
 *
 * Templates are inline (no filesystem access) and compiled via Handlebars.
 */
class TemplateEngine {
	/**
	 * Create a new TemplateEngine.
	 */
	constructor() {
		/** @type {Map<string, Function>} */
		this.templates = new Map()
	}

	/**
	 * Render an inline template to HTML.
	 * @param {string} templateName - Template name.
	 * @param {object} data - Template variables.
	 * @returns {Promise<string>} Rendered HTML.
	 */
	async render(templateName, data) {
		try {
			if (!templateName || typeof templateName !== 'string') {
				throw new Error('templateName is required')
			}

			var hb = await getHandlebars()

			var safeData = data && typeof data === 'object' ? data : {}

			var compiled = this.templates.get(templateName)
			if (!compiled) {
				var source = TemplateEngine.getInlineTemplate(templateName)
				if (!source) {
					throw new Error('Unknown template: ' + templateName)
				}

				compiled = hb.compile(source, {
					noEscape: false,
					strict: false,
				})

				this.templates.set(templateName, compiled)
			}

			return String(compiled(safeData))
		} catch (error) {
			error.message = '[TemplateEngine] Failed to render template: ' + error.message
			throw error
		}
	}

	/**
	 * Get an inline HTML template by type.
	 * @param {string} type - Template type.
	 * @returns {string|null} Inline template HTML.
	 */
	static getInlineTemplate(type) {
		try {
			var footer =
				'<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:18px">' +
				'<div>AICTE Idea Lab Booking System</div>' +
				'</div>'

			var baseHead =
				'<!doctype html>' +
				'<html>' +
				'<head>' +
				'<meta charset="utf-8" />' +
				'<meta name="viewport" content="width=device-width, initial-scale=1" />' +
				'</head>'

			var baseStart =
				baseHead +
				'<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif">' +
				'<div style="max-width:680px;margin:0 auto;padding:24px">' +
				'<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px">'

			var baseEnd = '</div></div></body></html>'

			if (type === 'auto-response') {
				return (
					baseStart +
					'<div style="font-size:18px;font-weight:700;color:#111827">Booking request received</div>' +
					'<div style="margin-top:12px;font-size:14px;color:#374151;line-height:22px">Hello {{name}},</div>' +
					'<div style="margin-top:10px;font-size:14px;color:#374151;line-height:22px">' +
					'We received your booking request (Reference: <strong>{{requestId}}</strong>). ' +
					'To proceed, please complete the booking form using the link below.' +
					'</div>' +
					'<div style="margin-top:18px">' +
					'<a href="{{formUrl}}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:8px;font-size:14px;font-weight:700">Open Booking Form</a>' +
					'</div>' +
					'<div style="margin-top:14px;font-size:12px;color:#6b7280;line-height:18px">' +
					'If the button does not work, copy and paste this URL into your browser:<br />' +
					'<span style="word-break:break-all">{{formUrl}}</span>' +
					'</div>' +
					footer +
					baseEnd
				)
			}

			if (type === 'approved') {
				return (
					baseStart +
					'<div style="font-size:18px;font-weight:700;color:#065f46">Booking approved</div>' +
					'<div style="margin-top:12px;font-size:14px;color:#374151;line-height:22px">Hello {{name}},</div>' +
					'<div style="margin-top:10px;font-size:14px;color:#374151;line-height:22px">' +
					'Good news—your booking request for <strong>{{eventName}}</strong> has been approved.' +
					'</div>' +
					'<div style="margin-top:16px;padding:14px;border:1px solid #d1fae5;background:#ecfdf5;border-radius:10px">' +
					'<div style="font-size:14px;color:#064e3b"><strong>Venue:</strong> {{venueName}}</div>' +
					'<div style="margin-top:6px;font-size:14px;color:#064e3b"><strong>Date:</strong> {{date}}</div>' +
					'<div style="margin-top:6px;font-size:14px;color:#064e3b"><strong>Time:</strong> {{timeSlot}}</div>' +
					'</div>' +
					'<div style="margin-top:14px;font-size:14px;color:#374151;line-height:22px">' +
					'If you need to make changes, please reply to this email.' +
					'</div>' +
					footer +
					baseEnd
				)
			}

			if (type === 'rejected') {
				return (
					baseStart +
					'<div style="font-size:18px;font-weight:700;color:#991b1b">Booking not approved</div>' +
					'<div style="margin-top:12px;font-size:14px;color:#374151;line-height:22px">Hello {{name}},</div>' +
					'<div style="margin-top:10px;font-size:14px;color:#374151;line-height:22px">' +
					'We are unable to approve your booking request at this time.' +
					'</div>' +
					'<div style="margin-top:14px;padding:14px;border:1px solid #fee2e2;background:#fef2f2;border-radius:10px">' +
					'<div style="font-size:14px;color:#7f1d1d"><strong>Reason:</strong> {{reason}}</div>' +
					'</div>' +
					'<div style="margin-top:14px;font-size:14px;color:#374151;line-height:22px">' +
					'You may reply to this email if you have questions.' +
					'</div>' +
					footer +
					baseEnd
				)
			}

			if (type === 'clarification') {
				return (
					baseStart +
					'<div style="font-size:18px;font-weight:700;color:#92400e">More information required</div>' +
					'<div style="margin-top:12px;font-size:14px;color:#374151;line-height:22px">Hello {{name}},</div>' +
					'<div style="margin-top:10px;font-size:14px;color:#374151;line-height:22px">' +
					'We need a bit more information to review your booking request.' +
					'</div>' +
					'<div style="margin-top:14px;padding:14px;border:1px solid #fde68a;background:#fffbeb;border-radius:10px">' +
					'<div style="font-size:14px;color:#78350f"><strong>Request:</strong> {{clarificationRequest}}</div>' +
					'</div>' +
					'<div style="margin-top:14px;font-size:14px;color:#374151;line-height:22px">' +
					'Please reply with the requested details so we can proceed.' +
					'</div>' +
					footer +
					baseEnd
				)
			}

			return null
		} catch (error) {
			error.message = '[TemplateEngine] Failed to load inline template: ' + error.message
			throw error
		}
	}
}

const templateEngine = new TemplateEngine()

export default templateEngine

