import mongoose from 'mongoose'

const securityActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: { type: String, required: true },
  detail: { type: String },
  timestamp: { type: Date, default: Date.now },
  iconType: { type: String },
})

const SecurityActivity = mongoose.models.SecurityActivity || mongoose.model('SecurityActivity', securityActivitySchema)

export default SecurityActivity
