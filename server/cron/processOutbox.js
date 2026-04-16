import cron from 'node-cron'

import outboxService from '../services/email/outboxService.js'

const PROCESS_OUTBOX_CRON = '*/5 * * * *'

/**
 * Run one outbox processing cycle.
 * @returns {Promise<void>} Nothing.
 */
async function processOutboxBatch() {
	try {
		console.info('[cron][processOutbox] Run started', {
			at: new Date().toISOString(),
			batchSize: 20,
		})

		const results = await outboxService.processOutbox(20)
		const list = Array.isArray(results) ? results : []

		let successCount = 0
		let failureCount = 0

		for (const item of list) {
			if (item && item.success) {
				successCount += 1
			} else {
				failureCount += 1
			}
		}

		console.info('[cron][processOutbox] Run completed', {
			at: new Date().toISOString(),
			processed: list.length,
			successCount,
			failureCount,
		})
	} catch (error) {
		console.error('[cron][processOutbox] Run failed', {
			at: new Date().toISOString(),
			message: error && error.message ? error.message : String(error),
		})
	}
}

// Self-register cron task when this module is imported.
cron.schedule(PROCESS_OUTBOX_CRON, processOutboxBatch)

console.info('[cron][processOutbox] Cron scheduled', {
	expression: PROCESS_OUTBOX_CRON,
	batchSize: 20,
})

