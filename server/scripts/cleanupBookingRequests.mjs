import process from 'node:process'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../../.env') })

const TARGET_EMAIL = 'mdrayyanjamil355@gmail.com'

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

		const result = await BookingRequest.deleteMany({ requesterEmail: TARGET_EMAIL })
		console.log('✅ Cleanup complete', {
			requesterEmail: TARGET_EMAIL,
			deletedCount: result && typeof result.deletedCount === 'number' ? result.deletedCount : null,
		})
	} catch (error) {
		console.error('❌ Cleanup failed', {
			message: error && error.message ? error.message : String(error),
		})
		process.exitCode = 1
	} finally {
		if (connected) {
			try {
				await mongoose.disconnect()
			} catch (error) {
				console.warn('⚠️ Failed to disconnect mongoose', {
					message: error && error.message ? error.message : String(error),
				})
			}
		}
	}
}

run()
