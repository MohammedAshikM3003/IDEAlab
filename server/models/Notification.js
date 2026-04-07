import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['maintenance', 'approval', 'report', 'security', 'general'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  color: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)

export default Notification
