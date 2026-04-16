import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId, Mixed } = Schema.Types

/**
 * Create the Outbox schema used as an email retry queue.
 * @returns {mongoose.Schema} Mongoose schema.
 */
function createOutboxSchema() {
	try {
		const errorHistoryItemSchema = new Schema(
			{
				timestamp: { type: Date, default: Date.now },
				error: { type: String },
				stack: { type: String },
			},
			{ _id: false },
		)

		const outboxSchema = new Schema({
			to: { type: String, required: true, trim: true },
			subject: { type: String, required: true, trim: true },
			bodyHtml: { type: String },
			bodyText: { type: String },
			templateName: { type: String },
			templateData: { type: Mixed },
			bookingRequestId: { type: ObjectId, ref: 'BookingRequest' },
			status: {
				type: String,
				enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
				default: 'pending',
				index: true,
			},
			attemptCount: { type: Number, default: 0 },
			maxAttempts: { type: Number, default: 5 },
			scheduledAt: { type: Date, default: Date.now },
			lastAttemptAt: { type: Date },
			nextAttemptAt: { type: Date },
			lastError: { type: String },
			errorHistory: { type: [errorHistoryItemSchema], default: [] },
			sentAt: { type: Date },
			providerMessageId: { type: String },
			createdAt: { type: Date, default: Date.now },
		})

		// Indexes
		outboxSchema.index({ status: 1, nextAttemptAt: 1 })
		outboxSchema.index({ bookingRequestId: 1 })

		return outboxSchema
	} catch (error) {
		error.message = `Failed to create Outbox schema: ${error.message}`
		throw error
	}
}

/**
 * Get or create the Outbox model.
 * @returns {mongoose.Model} Outbox model.
 */
function getOutboxModel() {
	try {
		const schema = createOutboxSchema()
		return mongoose.models.Outbox || mongoose.model('Outbox', schema)
	} catch (error) {
		error.message = `Failed to initialize Outbox model: ${error.message}`
		throw error
	}
}

const Outbox = getOutboxModel()

export default Outbox

