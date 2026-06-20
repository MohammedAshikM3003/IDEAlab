import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import bcrypt from 'bcryptjs'

import User from '../models/User.js'
import Setting from '../models/Setting.js'
import SecurityActivity from '../models/SecurityActivity.js'
import { authMiddleware } from '../middleware/auth.js'
import gmailSenderService from '../services/gmail/gmailSenderService.js'

const router = express.Router()

const toSafeUser = (userDoc) => {
  if (!userDoc) return null

  const plain = userDoc.toObject ? userDoc.toObject() : userDoc
  const { password: _PASSWORD, ...safeUser } = plain
  return safeUser
}

const emailChangeRateLimit = new Map()

const checkRateLimit = (userId) => {
  const now = Date.now()
  const record = emailChangeRateLimit.get(userId.toString())

  if (!record) {
    emailChangeRateLimit.set(userId.toString(), { count: 1, resetAt: now + 3600000 })
    return true
  }

  if (now > record.resetAt) {
    emailChangeRateLimit.set(userId.toString(), { count: 1, resetAt: now + 3600000 })
    return true
  }

  if (record.count >= 3) {
    return false
  }

  record.count += 1
  return true
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

router.post('/me/request-email-change', authMiddleware, async (req, res) => {
  const { newEmail } = req.body
  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }

  const normalizedEmail = newEmail.trim().toLowerCase()

  if (normalizedEmail === req.user.email) {
    return res.status(400).json({ message: 'This is already your email address' })
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already in use' })
    }

    if (!checkRateLimit(req.user._id)) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        pendingEmail: normalizedEmail,
        emailChangeOtp: hashedOtp,
        emailChangeOtpExpires: expiresAt,
      },
    })

    await gmailSenderService.sendEmail({
      to: normalizedEmail,
      subject: 'Email Verification',
      bodyText: `Your KSRCE IdeaLab verification code is: ${otp}. Expires in 10 minutes.`,
    })

    await SecurityActivity.create({
      userId: req.user._id,
      action: 'Email change requested',
      detail: `Requested change to ${normalizedEmail}`,
      iconType: 'profile',
    })

    return res.json({ message: 'Verification code sent' })
  } catch (error) {
    console.error('Email change request failed', error)
    return res.status(500).json({ message: 'Failed to request email change' })
  }
})

router.post('/me/verify-email-change', authMiddleware, async (req, res) => {
  const { otp } = req.body

  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'Invalid OTP format' })
  }

  try {
    const user = await User.findById(req.user._id)
    if (!user || !user.pendingEmail || !user.emailChangeOtp || !user.emailChangeOtpExpires) {
      return res.status(400).json({ message: 'No pending email change found' })
    }

    if (Date.now() > user.emailChangeOtpExpires.getTime()) {
      return res.status(400).json({ message: 'Verification code has expired' })
    }

    const isValid = await bcrypt.compare(otp, user.emailChangeOtp)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' })
    }

    const newEmail = user.pendingEmail

    user.email = newEmail
    user.emailVerified = true
    user.pendingEmail = undefined
    user.emailChangeOtp = undefined
    user.emailChangeOtpExpires = undefined
    await user.save()

    await Setting.findOneAndUpdate(
      { userId: user._id },
      { $set: { 'profile.email': newEmail, 'profile.emailVerified': true } }
    )

    await SecurityActivity.create({
      userId: user._id,
      action: 'Email changed',
      detail: `Email was successfully changed to ${newEmail}`,
      iconType: 'success',
    })

    return res.json({ message: 'Email successfully changed', email: newEmail })
  } catch (error) {
    console.error('Email change verification failed', error)
    return res.status(500).json({ message: 'Failed to verify email change' })
  }
})

router.post('/me/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' })
  }

  try {
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    await SecurityActivity.create({
      userId: user._id,
      action: 'Password changed',
      detail: 'Password was updated from account settings',
      iconType: 'security',
    })

    return res.json({ message: 'Password successfully changed' })
  } catch (error) {
    console.error('Password change failed', error)
    return res.status(500).json({ message: 'Failed to change password' })
  }
})

export default router
