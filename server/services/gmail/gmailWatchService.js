import process from 'node:process'

import { gmail } from '../../config/gmail.js'

/**
 * Gmail watch service (Gmail push notifications -> Pub/Sub).
 */
class GmailWatchService {
	/**
	 * Start a Gmail watch to send notifications to a Pub/Sub topic.
	 * @param {string=} topicName - Pub/Sub topic name (not full path).
	 * @returns {Promise<{historyId:string, expiration:number}>} Watch result.
	 */
	async startWatch(topicName) {
		try {
			if (!gmail) {
				throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
			}

			var name = topicName || 'gmail-booking-requests'

			var projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
			if (!projectId) {
				throw new Error('Missing env var GOOGLE_CLOUD_PROJECT_ID')
			}

			var topicPath = 'projects/' + String(projectId) + '/topics/' + String(name)

			var res = await gmail.users.watch({
				userId: 'me',
				requestBody: {
					topicName: topicPath,
					labelIds: ['INBOX', 'UNREAD'],
					labelFilterBehavior: 'INCLUDE',
				},
			})

			var data = (res && res.data) || {}
			var expiration = data && data.expiration != null ? Number(data.expiration) : null
			var expiresAt = expiration ? new Date(expiration).toISOString() : null

			console.info('[GmailWatchService] watch started', {
				historyId: data.historyId,
				expiration,
				expiresAt,
			})

			return {
				historyId: data.historyId,
				expiration,
			}
		} catch (error) {
			console.error('[GmailWatchService] startWatch failed', {
				message: error && error.message ? error.message : String(error),
			})
			throw error
		}
	}

	/**
	 * Stop the current Gmail watch.
	 * @returns {Promise<{success:boolean}>} Result.
	 */
	async stopWatch() {
		try {
			if (!gmail) {
				throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
			}

			await gmail.users.stop({ userId: 'me' })

			console.info('[GmailWatchService] watch stopped')

			return { success: true }
		} catch (error) {
			console.error('[GmailWatchService] stopWatch failed', {
				message: error && error.message ? error.message : String(error),
			})
			throw error
		}
	}

	/**
	 * Get current watch status.
	 * Note: placeholder implementation; real status should be tracked in DB.
	 * @returns {Promise<{active:boolean,lastRenewed:(Date|null),expiresAt:(Date|null)}>} Status.
	 */
	async getWatchStatus() {
		return {
			active: true,
			lastRenewed: null,
			expiresAt: null,
		}
	}
}

const gmailWatchService = new GmailWatchService()

export default gmailWatchService

