import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
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
  },
  { _id: true },
)

const securityActivityItemSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    detail: { type: String },
    timestamp: { type: Date, default: Date.now },
    iconType: { type: String },
  },
  { _id: true },
)

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profile: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, default: 'admin' },
      designation: { type: String, default: '' },
      avatar: { type: String, default: '' },
      mobile: { type: String, default: '' },
      twoFactorEnabled: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false },
      lastLogin: { type: Date },
      memberSince: { type: Date, default: Date.now },
    },
    notifications: {
      type: [notificationSchema],
      default: [],
    },
    securityActivity: {
      type: [securityActivityItemSchema],
      default: [],
    },
  },
  { timestamps: true },
)

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingsSchema)

export default Setting
