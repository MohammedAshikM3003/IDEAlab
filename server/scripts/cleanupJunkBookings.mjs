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

		const { default: BookingRequest } = await import('../models/BookingRequest.js')

		const senderPatterns = [
			'mailer-daemon',
			'noreply',
			'no-reply',
			'bounce',
			'postmaster',
			'team.mongodb.com',
			'mail.mongodb.com',
			'amazonses.com',
		]
		const subjectPatterns = [
			'delivery status notification',
			'delivery failure',
			'undeliverable',
			'automatic reply',
			'out of office',
			'newsletter',
			'unsubscribe',
		]

		const senderRegexes = senderPatterns.map((pattern) => new RegExp(pattern, 'i'))
		const subjectRegexes = subjectPatterns.map((pattern) => new RegExp(pattern, 'i'))

		const result = await BookingRequest.deleteMany({
			$or: [
				{ requesterEmail: { $in: senderRegexes } },
				{ subject: { $in: subjectRegexes } },
			],
		})

		const deletedCount = result && typeof result.deletedCount === 'number' ? result.deletedCount : 0
		console.log(`✅ Deleted ${deletedCount} junk booking request(s).`)
	} catch (error) {
		console.error('❌ Cleanup failed:', error?.message || String(error))
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
