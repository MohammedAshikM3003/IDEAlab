/* eslint-env node */

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import process from 'node:process'
import path from 'node:path'

import User from './models/User.js'

// Existing routes
import notificationRoutes from './routes/notifications.js'
import userRoutes from './routes/users.js'
import securityRoutes from './routes/securityActivity.js'
import settingsRoutes from './routes/settings.js'
import facilityMediaRoutes from './routes/facilityMedia.js'
import venueRoutes from './routes/venues.js'

// Gmail booking system routes
import webhookRoutes from './routes/webhookRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'

// Load environment variables (equivalent to require('dotenv').config() in CommonJS)
dotenv.config()

// Self-registering cron jobs
// Loaded defensively so missing optional dependencies (e.g., node-cron) don't prevent server startup.
import('./cron/renewGmailWatch.js').catch((error) => {
  console.warn('[cron] renewGmailWatch not loaded:', error?.message || String(error))
})
import('./cron/processOutbox.js').catch((error) => {
  console.warn('[cron] processOutbox not loaded:', error?.message || String(error))
})

const app = express()
const PORT = Number(process.env.PORT || 5000)
const MONGODB_URI = process.env.MONGODB_URI

app.use(cors())

// Webhook route needs raw body for Pub/Sub signature verification
// IMPORTANT: mount this before express.json() so the body is not consumed/parsed first.
app.use('/api/webhooks', express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))
app.use('/uploads', express.static(path.resolve('server/uploads')))

// Gmail booking system routes
app.use('/api/webhooks', webhookRoutes)
app.use('/api/bookings', bookingRoutes)

// Existing routes
app.use('/api/notifications', notificationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/security-activity', securityRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/facilities/media', facilityMediaRoutes)
app.use('/api/venues', venueRoutes)

app.use((error, _req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request is too large. Please reduce image sizes and try again.' })
  }

  return next(error)
})

app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState
  const dbConnected = dbState === 1

  res.json({
    ok: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: ['api', 'gmail-webhook', 'outbox-processor'],
    dbConnected,
    dbState,
    service: 'auth-api',
  })
})

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: ['api', 'gmail-webhook', 'outbox-processor'],
  })
})

app.post('/api/auth/login', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is not connected yet' })
  }

  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    user.lastLogin = new Date()
    await user.save()

    return res.json({
      message: 'Login successful',
      token: String(user._id),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch {
    return res.status(500).json({ message: 'Authentication failed' })
  }
})

const ensureDefaultAdmin = async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL
  const password = process.env.DEFAULT_ADMIN_PASSWORD

  if (!email || !password) {
    return
  }

  const normalizedEmail = String(email).toLowerCase().trim()
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({
    email: normalizedEmail,
    password: passwordHash,
    name: process.env.DEFAULT_ADMIN_NAME || 'Admin',
    role: 'admin',
  })
}

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Auth server running on http://localhost:${PORT}`)
  })

  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Health endpoint is available but login will fail until DB is configured.')
    return
  }

  try {
    await mongoose.connect(MONGODB_URI)
    await ensureDefaultAdmin()
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
  }
}

startServer().catch((error) => {
  console.error('Server startup failed:', error.message)
  process.exit(1)
})
