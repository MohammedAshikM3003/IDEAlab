import mongoose from 'mongoose'

const { Schema } = mongoose
const { ObjectId, Mixed } = Schema.Types

/**
 * Create the BookingRequest schema.
 * @returns {mongoose.Schema} Mongoose schema.
 */
function createBookingRequestSchema() {
	try {
		const extractedDetailsSchema = new Schema(
			{
				requestedDate: { type: String },
				venueRequested: { type: String },
				department: { type: String },
				eventPurpose: { type: String },
				supervisor: { type: String },
			},
			{ _id: false },
		)

		const formResponseSchema = new Schema(
			{
				formId: { type: String },
				responseId: { type: String },
				submittedAt: { type: Date },
				answers: { type: Mixed },
			},
			{ _id: false },
		)

		const adminActionSchema = new Schema(
			{
				action: { type: String, required: true },
				performedBy: { type: ObjectId, ref: 'User' },
				performedAt: { type: Date, default: Date.now },
				comments: { type: String },
			},
			{ _id: true },
		)

		const timeSlotSchema = new Schema(
			{
				start: { type: String },
				end: { type: String },
			},
			{ _id: false },
		)

		const confirmedBookingSchema = new Schema(
			{
				venue: { type: ObjectId, ref: 'Venue' },
				date: { type: Date },
				timeSlot: { type: timeSlotSchema },
				approvedAt: { type: Date },
				approvedBy: { type: ObjectId, ref: 'User' },
			},
			{ _id: false },
		)

		const bookingRequestSchema = new Schema(
			{
				emailMessageId: {
					type: String,
					required: true,
					unique: true,
					index: true,
					trim: true,
				},
				emailThreadId: {
					type: String,
					required: true,
					trim: true,
				},
				requesterEmail: {
					type: String,
					required: true,
					trim: true,
				},
				requesterName: {
					type: String,
					required: true,
					trim: true,
				},
				subject: { type: String },
				rawEmailContent: { type: String },
				extractedDetails: { type: extractedDetailsSchema },
				formResponse: { type: formResponseSchema },
				status: {
					type: String,
					enum: [
						'pending',
						'form_sent',
						'form_received',
						'under_review',
						'approved',
						'rejected',
						'clarification_requested',
						'cancelled',
					],
					default: 'pending',
					index: true,
				},
				adminActions: { type: [adminActionSchema], default: [] },
				confirmedBooking: { type: confirmedBookingSchema },
				receivedAt: { type: Date, default: Date.now, index: true },
			},
			{ timestamps: true },
		)

		// Indexes
		bookingRequestSchema.index({ status: 1, receivedAt: -1 })
		bookingRequestSchema.index({ requesterEmail: 1 })

		return bookingRequestSchema
	} catch (error) {
		error.message = `Failed to create BookingRequest schema: ${error.message}`
		throw error
	}
}

/**
 * Get or create the BookingRequest model.
 * @returns {mongoose.Model} BookingRequest model.
 */
function getBookingRequestModel() {
	try {
		const schema = createBookingRequestSchema()
		return mongoose.models.BookingRequest || mongoose.model('BookingRequest', schema)
	} catch (error) {
		error.message = `Failed to initialize BookingRequest model: ${error.message}`
		throw error
	}
}

const BookingRequest = getBookingRequestModel()

export default BookingRequest

