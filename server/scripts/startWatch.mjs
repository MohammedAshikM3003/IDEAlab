import process from 'node:process'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env') })

async function run() {
	let connected = false

	try {
		const mongoUri = process.env.MONGODB_URI
		if (!mongoUri) {
			throw new Error('MONGODB_URI is not set')
		}

		await mongoose.connect(mongoUri)
		connected = true

		const { default: GmailWatchService } = await import('../services/gmail/gmailWatchService.js')
		const result = await GmailWatchService.startWatch()
		console.log('✅ Watch started:', result)
	} catch (error) {
		console.error('❌ Failed:', error?.message || String(error))
	} finally {
		if (connected) {
			try {
				await mongoose.disconnect()
			} catch (error) {
				console.warn('⚠️ Failed to disconnect mongoose:', error?.message || String(error))
			}
		}

		setTimeout(() => {
			process.exit(0)
		}, 2000)
	}
}

run()
