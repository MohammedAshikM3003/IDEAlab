import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env') })

async function run() {
	try {
		const { gmail } = await import('../config/gmail.js')
		if (!gmail) {
			throw new Error('Gmail API client is not initialized. Check server/config/gmail.js')
		}

		const listRes = await gmail.users.messages.list({
			userId: 'me',
			maxResults: 50,
			q: 'is:unread in:inbox',
		})

		const listData = (listRes && listRes.data) || {}
		const listMessages = Array.isArray(listData.messages) ? listData.messages : []
		const ids = listMessages
			.map((msg) => (msg && msg.id ? String(msg.id) : null))
			.filter((id) => Boolean(id))

		if (ids.length === 0) {
			console.log('No unread messages found in inbox.')
			return
		}

		await gmail.users.messages.batchModify({
			userId: 'me',
			requestBody: {
				ids: ids,
				removeLabelIds: ['UNREAD'],
			},
		})

		console.log('Marked unread messages as read:', { count: ids.length })
	} catch (error) {
		console.error('Failed to mark unread messages as read:', error?.message || String(error))
	}
}

run()
