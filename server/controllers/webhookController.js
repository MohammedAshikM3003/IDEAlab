/* global setImmediate */

import { Buffer } from 'node:buffer'

import gmailWebhookService from '../services/gmail/gmailWebhookService.js'

/**
 * Webhook controller for Pub/Sub callbacks.
 */
class WebhookController {
	/**
	 * Handle Pub/Sub push notifications from Gmail watch.
	 *
	 * Notes:
	 * - Pub/Sub sends a push body: { message: { data: base64(JSON) }, subscription: string }
	 * - This handler returns immediately and processes in the background.
	 *
	 * @param {import('express').Request} req - Express request.
	 * @param {import('express').Response} res - Express response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async handlePubSubNotification(req, res) {
		try {
			// When mounted with express.raw(), req.body will be a Buffer.
			// When mounted with express.json(), req.body will be an object.
			let body = req.body
			if (Buffer.isBuffer(body)) {
				const raw = body.toString('utf8')
				body = raw ? JSON.parse(raw) : null
			}

			if (!body || !body.message) {
				return res.status(400).json({ error: 'Invalid Pub/Sub payload: missing message' })
			}

			const { message } = body
			const encoded = message.data

			if (!encoded) {
				return res.status(400).json({ error: 'Invalid Pub/Sub payload: missing message.data' })
			}

			const jsonString = Buffer.from(String(encoded), 'base64').toString('utf8')
			const pubsubData = JSON.parse(jsonString)

			console.info('[WebhookController] Pub/Sub notification received', {
				emailAddress: pubsubData?.emailAddress || null,
				historyId: pubsubData?.historyId || null,
			})

			// Fire-and-forget processing so we can acknowledge quickly.
			setImmediate(() => {
				Promise.resolve(gmailWebhookService.processNotification(pubsubData)).catch((error) => {
					console.error('[WebhookController] Background processing failed', {
						message: error && error.message ? error.message : String(error),
						emailAddress: pubsubData?.emailAddress || null,
						historyId: pubsubData?.historyId || null,
					})
				})
			})

			return res.status(200).json({
				status: 'accepted',
				message: 'Notification queued for processing',
			})
		} catch (error) {
			return res.status(500).json({
				error: 'Failed to handle Pub/Sub notification',
				details: error && error.message ? error.message : String(error),
			})
		}
	}

	/**
	 * Health check for the webhook service.
	 * @param {import('express').Request} _req - Express request.
	 * @param {import('express').Response} res - Express response.
	 * @returns {Promise<import('express').Response>} Response.
	 */
	async healthCheck(_req, res) {
		return res.json({
			status: 'active',
			timestamp: new Date().toISOString(),
			service: 'gmail-webhook',
		})
	}
}

const webhookController = new WebhookController()

export default webhookController

