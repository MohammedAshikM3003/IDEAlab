import mongoose from 'mongoose'

const BookingFormTokenSchema = new mongoose.Schema({
	token: { type: String, required: true, unique: true },
	bookingRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookingRequest', required: true },
	refCode: { type: String, required: true },
	status: { type: String, enum: ['active', 'used', 'expired'], default: 'active' },
	createdAt: { type: Date, default: Date.now },
	expiresAt: { type: Date, required: true },
	usedAt: { type: Date, default: null },
})

const BookingFormToken = mongoose.models.BookingFormToken || mongoose.model('BookingFormToken', BookingFormTokenSchema)

export default BookingFormToken
