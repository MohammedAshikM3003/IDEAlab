import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import { GridFSBucket, ObjectId } from 'mongodb'
import { Readable } from 'node:stream'

import { authMiddleware } from '../middleware/auth.js'
import Setting from '../models/Setting.js'

const router = express.Router()
const GRIDFS_BUCKET_NAME = 'settingsImages'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 2 } })

const getBucket = () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('Database is not connected')
  }

  return new GridFSBucket(mongoose.connection.db, { bucketName: GRIDFS_BUCKET_NAME })
}

const extractGridFsIdFromAvatarPath = (avatarPath) => {
  if (!avatarPath || typeof avatarPath !== 'string') {
    return null
  }

  const match = avatarPath.match(/\/api\/settings\/images\/([a-fA-F0-9]{24})$/)
  if (!match?.[1]) {
    return null
  }

  return match[1]
}

const toProfileFromUser = (user) => ({
  name: user.name,
  email: user.email,
  role: user.role,
  designation: user.designation || '',
  avatar: user.avatar || '',
  mobile: user.mobile || '',
  twoFactorEnabled: Boolean(user.twoFactorEnabled),
  emailVerified: Boolean(user.emailVerified),
  lastLogin: user.lastLogin,
  memberSince: user.memberSince || user.createdAt,
})

const ensureSettings = async (user) => {
  let settings = await Setting.findOne({ userId: user._id })
  if (settings) {
    return settings
  }

  settings = await Setting.create({
    userId: user._id,
    profile: toProfileFromUser(user),
    notifications: [],
    securityActivity: [],
  })

  return settings
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const settings = await ensureSettings(req.user)
    return res.json(settings)
  } catch {
    return res.status(500).json({ message: 'Failed to load settings' })
  }
})

router.get('/images/:id', async (req, res) => {
  const { id } = req.params
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid image id' })
  }

  try {
    const bucket = getBucket()
    const fileId = new ObjectId(id)
    const files = await bucket.find({ _id: fileId }).toArray()
    const file = files[0]

    if (!file) {
      return res.status(404).json({ message: 'Image not found' })
    }

    res.setHeader('Content-Type', file.contentType || 'application/octet-stream')
    const stream = bucket.openDownloadStream(fileId)

    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to read image stream' })
      }
    })

    return stream.pipe(res)
  } catch {
    return res.status(500).json({ message: 'Failed to load image' })
  }
})

router.put('/profile', authMiddleware, async (req, res) => {
  const { name, designation, mobile } = req.body || {}

  try {
    const settings = await ensureSettings(req.user)

    settings.profile.name = typeof name === 'string' && name.trim() ? name.trim() : settings.profile.name
    settings.profile.designation = typeof designation === 'string' ? designation.trim() : settings.profile.designation
    settings.profile.mobile = typeof mobile === 'string' ? mobile.trim() : settings.profile.mobile

    settings.securityActivity.unshift({
      action: 'Profile information updated',
      detail: 'Profile details were updated from settings page',
      iconType: 'info',
      timestamp: new Date(),
    })

    settings.securityActivity = settings.securityActivity.slice(0, 10)

    await settings.save()

    req.user.name = settings.profile.name
    req.user.designation = settings.profile.designation
    req.user.mobile = settings.profile.mobile
    await req.user.save()

    return res.json(settings)
  } catch {
    return res.status(500).json({ message: 'Failed to update profile' })
  }
})

router.patch('/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    const settings = await ensureSettings(req.user)
    settings.notifications = settings.notifications.map((item) => ({ ...item.toObject(), read: true }))
    await settings.save()

    return res.json({ success: true, message: 'All notifications marked as read', settings })
  } catch {
    return res.status(500).json({ message: 'Failed to update notifications' })
  }
})

router.delete('/notifications', authMiddleware, async (req, res) => {
  try {
    const settings = await ensureSettings(req.user)
    settings.notifications = []
    await settings.save()

    return res.json({ success: true, settings })
  } catch {
    return res.status(500).json({ message: 'Failed to clear notifications' })
  }
})

router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: 'Avatar file is required' })
  }

  if (!String(req.file.mimetype || '').startsWith('image/')) {
    return res.status(400).json({ message: 'Only image uploads are supported' })
  }

  try {
    const settings = await ensureSettings(req.user)
    const bucket = getBucket()

    const filename = `${req.user._id}-${Date.now()}-${req.file.originalname || 'avatar.png'}`
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: {
        userId: req.user._id.toString(),
        source: 'settings-avatar',
      },
    })

    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer).pipe(uploadStream).on('error', reject).on('finish', resolve)
    })

    const previousAvatarId = extractGridFsIdFromAvatarPath(settings.profile.avatar)
    if (previousAvatarId && ObjectId.isValid(previousAvatarId)) {
      try {
        await bucket.delete(new ObjectId(previousAvatarId))
      } catch {
        // Ignore missing/invalid previous file during replacement.
      }
    }

    const avatarPath = `/api/settings/images/${uploadStream.id.toString()}`

    settings.profile.avatar = avatarPath
    settings.securityActivity.unshift({
      action: 'Profile photo updated',
      detail: 'Profile avatar was updated',
      iconType: 'info',
      timestamp: new Date(),
    })
    settings.securityActivity = settings.securityActivity.slice(0, 10)
    await settings.save()

    req.user.avatar = avatarPath
    await req.user.save()

    return res.json(settings)
  } catch {
    return res.status(500).json({ message: 'Failed to update avatar' })
  }
})

export default router
