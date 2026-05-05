import mongoose from 'mongoose'

const SYSTEM_SETTINGS_USER_ID = new mongoose.Types.ObjectId('000000000000000000000000')

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
    gmail: {
      lastHistoryId: { type: String },
      lastHistoryUpdatedAt: { type: Date },
      lastWatchHistoryId: { type: String },
      lastWatchUpdatedAt: { type: Date },
    },
  },
  { timestamps: true },
)

settingsSchema.statics.getLastGmailHistoryId = async function getLastGmailHistoryId() {
  const doc = await this.findOne({ userId: SYSTEM_SETTINGS_USER_ID })
    .select('gmail.lastHistoryId')
    .lean()

  return doc?.gmail?.lastHistoryId || null
}

settingsSchema.statics.setLastGmailHistoryId = async function setLastGmailHistoryId(historyId) {
  if (!historyId) return null

  const now = new Date()

  await this.findOneAndUpdate(
    { userId: SYSTEM_SETTINGS_USER_ID },
    {
      $set: {
        'gmail.lastHistoryId': String(historyId),
        'gmail.lastHistoryUpdatedAt': now,
      },
      $setOnInsert: {
        userId: SYSTEM_SETTINGS_USER_ID,
        profile: {
          name: 'System',
          email: 'system@local',
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )

  return String(historyId)
}

settingsSchema.statics.getLastGmailWatchHistoryId = async function getLastGmailWatchHistoryId() {
  const doc = await this.findOne({ userId: SYSTEM_SETTINGS_USER_ID })
    .select('gmail.lastWatchHistoryId')
    .lean()

  return doc?.gmail?.lastWatchHistoryId || null
}

settingsSchema.statics.setLastGmailWatchHistoryId = async function setLastGmailWatchHistoryId(historyId) {
  if (!historyId) return null

  const now = new Date()

  await this.findOneAndUpdate(
    { userId: SYSTEM_SETTINGS_USER_ID },
    {
      $set: {
        'gmail.lastWatchHistoryId': String(historyId),
        'gmail.lastWatchUpdatedAt': now,
      },
      $setOnInsert: {
        userId: SYSTEM_SETTINGS_USER_ID,
        profile: {
          name: 'System',
          email: 'system@local',
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )

  return String(historyId)
}

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingsSchema)

export default Setting
