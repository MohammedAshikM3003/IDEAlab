/* eslint-env node */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import process from 'node:process'
import bcrypt from 'bcryptjs'

dotenv.config()

import User from '../models/User.js'
import Notification from '../models/Notification.js'
import SecurityActivity from '../models/SecurityActivity.js'
import Setting from '../models/Setting.js'

const MONGODB_URI = process.env.MONGODB_URI

const seed = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  await mongoose.connect(MONGODB_URI)

  const adminEmail = String(process.env.DEFAULT_ADMIN_EMAIL || 'admin@ksrce.ac.in').toLowerCase().trim()
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Password@123'

  let user = await User.findOne({ email: adminEmail })
  if (!user) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    user = await User.create({
      name: process.env.DEFAULT_ADMIN_NAME || 'KSR Admin',
      email: adminEmail,
      password: passwordHash,
      role: 'admin',
      designation: 'Chief Administrator',
      emailVerified: true,
      twoFactorEnabled: false,
      lastLogin: new Date(),
    })
  }

  await Notification.deleteMany({})
  await Notification.insertMany([
    {
      type: 'maintenance',
      title: 'System Maintenance Scheduled',
      message: 'The portal will be down for maintenance on Oct 28th from 2 AM to 4 AM.',
      read: false,
      color: 'info',
    },
    {
      type: 'approval',
      title: 'Pending Venue Approvals',
      message: 'You have 5 venue requests awaiting your approval.',
      read: false,
      color: 'warn',
    },
    {
      type: 'report',
      title: 'Monthly Report Generated',
      message: 'October analytics report is ready for download.',
      read: false,
      color: 'ok',
    },
  ])

  await SecurityActivity.deleteMany({ userId: user._id })
  await SecurityActivity.insertMany([
    {
      userId: user._id,
      action: 'Password updated successfully',
      detail: 'Password was recently changed',
      iconType: 'success',
      timestamp: new Date(),
    },
    {
      userId: user._id,
      action: 'New login from Chrome/Windows',
      detail: 'A new desktop login session was detected',
      iconType: 'device',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      userId: user._id,
      action: 'Profile information updated',
      detail: 'Profile details were updated',
      iconType: 'info',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ])

  await Setting.deleteMany({ userId: user._id })
  await Setting.create({
    userId: user._id,
    profile: {
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation || 'Chief Administrator',
      avatar: user.avatar || '',
      mobile: user.mobile || '',
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      emailVerified: Boolean(user.emailVerified),
      lastLogin: user.lastLogin || new Date(),
      memberSince: user.memberSince || new Date(),
    },
    notifications: [
      {
        type: 'maintenance',
        title: 'System Maintenance Scheduled',
        message: 'The portal will be down for maintenance on Oct 28th from 2 AM to 4 AM.',
        read: false,
        color: 'info',
      },
      {
        type: 'approval',
        title: 'Pending Venue Approvals',
        message: 'You have 5 venue requests awaiting your approval.',
        read: false,
        color: 'warn',
      },
      {
        type: 'report',
        title: 'Monthly Report Generated',
        message: 'October analytics report is ready for download.',
        read: false,
        color: 'ok',
      },
    ],
    securityActivity: [
      {
        action: 'Password updated successfully',
        detail: 'Password was recently changed',
        iconType: 'success',
        timestamp: new Date(),
      },
      {
        action: 'New login from Chrome/Windows',
        detail: 'A new desktop login session was detected',
        iconType: 'device',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        action: 'Profile information updated',
        detail: 'Profile details were updated',
        iconType: 'info',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
  })

  console.log('Settings seed completed successfully')
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message)
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
