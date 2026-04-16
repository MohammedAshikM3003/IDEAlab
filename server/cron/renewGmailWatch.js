import cron from 'node-cron'

import gmailWatchService from '../services/gmail/gmailWatchService.js'

const RENEW_WATCH_CRON = '0 2 */6 * *'

/**
 * Run one Gmail watch renewal cycle.
 * @returns {Promise<void>} Nothing.
 */
async function renewWatch() {
	try {
		console.info('[cron][renewGmailWatch] Renewal started', {
			at: new Date().toISOString(),
		})

		const result = await gmailWatchService.startWatch()

		console.info('[cron][renewGmailWatch] Renewal succeeded', {
			at: new Date().toISOString(),
			historyId: result?.historyId || null,
			expiration: result?.expiration || null,
		})
	} catch (error) {
		console.error('[cron][renewGmailWatch] Renewal failed', {
			at: new Date().toISOString(),
			message: error && error.message ? error.message : String(error),
		})
	}
}

// Self-register cron task when this module is imported.
cron.schedule(RENEW_WATCH_CRON, renewWatch)

console.info('[cron][renewGmailWatch] Cron scheduled', {
	expression: RENEW_WATCH_CRON,
})

