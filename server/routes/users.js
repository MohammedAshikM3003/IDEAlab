import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'

import User from '../models/User.js'
import SecurityActivity from '../models/SecurityActivity.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

const toSafeUser = (userDoc) => {
  if (!userDoc) return null

  const plain = userDoc.toObject ? userDoc.toObject() : userDoc
  const { password: _PASSWORD, ...safeUser } = plain
  return safeUser
}

const avatarUploadPath = path.resolve('server/uploads/avatars')
if (!fs.existsSync(avatarUploadPath)) {
  fs.mkdirSync(avatarUploadPath, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarUploadPath)
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.png'
    cb(null, `${req.user._id}-${Date.now()}${extension}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2 },
})

router.get('/me', authMiddleware, async (req, res) => {
  return res.json(toSafeUser(req.user))
})

router.put('/me', authMiddleware, async (req, res) => {
  const { name, designation, mobile } = req.body || {}

  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(typeof name === 'string' ? { name: name.trim() } : {}),
          ...(typeof designation === 'string' ? { designation: designation.trim() } : {}),
          ...(typeof mobile === 'string' ? { mobile: mobile.trim() } : {}),
        },
      },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ message: 'User not found' })
    }

    await SecurityActivity.create({
      userId: updated._id,
      action: 'Profile information updated',
      detail: 'Profile details were updated from settings page',
      iconType: 'profile',
    })

    return res.json(toSafeUser(updated))
  } catch {
    return res.status(500).json({ message: 'Failed to update profile' })
  }
})

router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Avatar file is required' })
  }

  const relativePath = `/uploads/avatars/${req.file.filename}`

  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatar: relativePath } },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ message: 'User not found' })
    }

    await SecurityActivity.create({
      userId: updated._id,
      action: 'Profile photo updated',
      detail: 'Profile avatar was updated',
      iconType: 'profile',
    })

    return res.json(toSafeUser(updated))
  } catch {
    return res.status(500).json({ message: 'Failed to update avatar' })
  }
})

export default router
