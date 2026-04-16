import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId, Mixed } = Schema.Types

/**
 * Create the EmailLog schema used for email audit trail.
 * @returns {mongoose.Schema} Mongoose schema.
 */
function createEmailLogSchema() {
	try {
		const gmailDataSchema = new Schema(
			{
				historyId: { type: String },
				threadId: { type: String },
				labelIds: { type: [String], default: undefined },
			},
			{ _id: false },
		)

		const emailLogSchema = new Schema(
			{
				messageId: { type: String, unique: true, sparse: true, trim: true },
				direction: {
					type: String,
					enum: ['incoming', 'outgoing'],
					required: true,
				},
				from: { type: String, trim: true },
				to: { type: String, required: true, trim: true },
				subject: { type: String },
				contentHash: { type: String },
				bookingRequestId: { type: ObjectId, ref: 'BookingRequest' },
				outboxId: { type: ObjectId, ref: 'Outbox' },
				receivedAt: { type: Date },
				processedAt: { type: Date, default: Date.now },
				processingStatus: {
					type: String,
					enum: ['received', 'parsed', 'queued', 'sent', 'failed', 'duplicate'],
				},
				provider: { type: String, default: 'gmail_api' },
				providerDetails: { type: Mixed },
				gmailData: { type: gmailDataSchema },
			},
			{ timestamps: true },
		)

		return emailLogSchema
	} catch (error) {
		error.message = `Failed to create EmailLog schema: ${error.message}`
		throw error
	}
}

/**
 * Get or create the EmailLog model.
 * @returns {mongoose.Model} EmailLog model.
 */
function getEmailLogModel() {
	try {
		const schema = createEmailLogSchema()
		return mongoose.models.EmailLog || mongoose.model('EmailLog', schema)
	} catch (error) {
		error.message = `Failed to initialize EmailLog model: ${error.message}`
		throw error
	}
}

const EmailLog = getEmailLogModel()

export default EmailLog

