import express from 'express'
import mongoose from 'mongoose'

import Venue from '../models/Venue.js'
import BookingRequest from '../models/BookingRequest.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/public', async (_req, res) => {
  try {
    const venues = await Venue.find({ status: 'active' })
      .select('_id name location description capacity bannerImage gallery amenities wifiStatus status')
      .sort({ createdAt: -1 })
      .lean()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const bookings = await BookingRequest.find({
      status: 'approved',
      'confirmedBooking.date': { $gte: today }
    }).select('confirmedBooking.venue confirmedBooking.date confirmedBooking.timeSlot')

    venues.forEach(venue => {
      venue.upcomingBookings = bookings
        .filter(b => b.confirmedBooking?.venue?.toString() === venue._id.toString())
        .map(b => ({
          date: b.confirmedBooking.date,
          timeSlot: b.confirmedBooking.timeSlot
        }))
    })

    return res.json(venues)
  } catch {
    return res.status(500).json({ message: 'Failed to load venues' })
  }
})

router.get('/public-stats', async (_req, res) => {
  try {
    const venuesCount = await Venue.countDocuments({ status: 'active' })
    
    // Count bookings received in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const monthlyBookings = await BookingRequest.countDocuments({
      receivedAt: { $gte: thirtyDaysAgo }
    })

    return res.json({
      venuesCount,
      monthlyBookings,
      approvalTime: '24h',
      digitalProcess: '100%'
    })
  } catch {
    return res.status(500).json({ message: 'Failed to load stats' })
  }
})

router.get('/public/:id', async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid venue id' })
  }

  try {
    const venue = await Venue.findOne({ _id: id, status: 'active' }).lean()
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const bookings = await BookingRequest.find({
      status: 'approved',
      'confirmedBooking.venue': venue._id,
      'confirmedBooking.date': { $gte: today }
    }).select('confirmedBooking.date confirmedBooking.timeSlot')

    venue.upcomingBookings = bookings.map(b => ({
      date: b.confirmedBooking.date,
      timeSlot: b.confirmedBooking.timeSlot
    }))

    return res.json(venue)
  } catch {
    return res.status(500).json({ message: 'Failed to load venue' })
  }
})

router.get('/:id/occupancy', async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid venue id' })
  }

  try {
    const venue = await Venue.findById(id).lean()
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    const capacity = venue.capacity || 0

    // 1. Get current date and time explicitly in IST
    const now = new Date()
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false })
    // istString format: "8/4/2026, 11:50:05"
    
    const [datePart, timePart] = istString.split(', ')
    const [month, day, year] = datePart.split('/')
    const todayStrIST = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    const [hour, minute] = timePart.split(':')
    let currentISTMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10)
    if (parseInt(hour, 10) === 24) { 
      currentISTMinutes = parseInt(minute, 10) 
    }

    // 2. Helper to safely parse a time string (e.g. "9:00 AM") into minutes since midnight
    const parseTime = (timeStr) => {
      const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!match) return -1
      let h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      const ampm = match[3].toUpperCase()
      if (ampm === 'PM' && h !== 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0
      return h * 60 + m
    }
    
    // Find all approved bookings for this venue
    const bookings = await BookingRequest.find({
      status: 'approved',
      'confirmedBooking.venue': venue._id,
    }).lean()

    let currentOccupancy = 0
    const upcomingToday = []

    bookings.forEach(booking => {
      if (!booking.confirmedBooking || !booking.confirmedBooking.date || !booking.confirmedBooking.timeSlot) return
      
      const bookingDateStr = new Date(booking.confirmedBooking.date).toISOString().split('T')[0]
      if (bookingDateStr !== todayStrIST) return
      
      const startTimeStr = booking.confirmedBooking.timeSlot.start
      const endTimeStr = booking.confirmedBooking.timeSlot.end
      if (!startTimeStr || !endTimeStr) return

      const startMins = parseTime(startTimeStr)
      const endMins = parseTime(endTimeStr)
      if (startMins < 0 || endMins < 0) return

      const attendees = booking.extractedDetails?.attendees || 0

      if (currentISTMinutes >= startMins && currentISTMinutes <= endMins) {
        currentOccupancy += attendees
      } else if (startMins > currentISTMinutes) {
        upcomingToday.push({
          timeSlot: `${startTimeStr} - ${endTimeStr}`,
          attendees
        })
      }
    })

    return res.json({
      capacity,
      currentOccupancy,
      available: Math.max(0, capacity - currentOccupancy),
      upcomingToday
    })
  } catch (error) {
    console.error('Failed to load occupancy:', error)
    return res.status(500).json({ message: 'Failed to load occupancy data' })
  }
})

router.get('/', authMiddleware, async (_req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 })
    return res.json(venues)
  } catch {
    return res.status(500).json({ message: 'Failed to load venues' })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid venue id' })
  }

  try {
    const venue = await Venue.findById(id)
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    return res.json(venue)
  } catch {
    return res.status(500).json({ message: 'Failed to load venue' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  const {
    name,
    facilityType,
    capacity,
    size,
    location,
    description,
    inventory,
    equipment,
    amenities,
    bannerImage,
    gallery,
  } = req.body || {}

  if (!String(name || '').trim()) {
    return res.status(400).json({ message: 'Facility name is required' })
  }

  try {
    const venue = new Venue({
      name: String(name).trim(),
      facilityType,
      capacity,
      size,
      location,
      description,
      inventory,
      equipment,
      amenities,
      bannerImage,
      gallery,
      updatedAt: new Date(),
    })

    const createdVenue = await venue.save()

    return res.status(201).json(createdVenue)
  } catch {
    return res.status(500).json({ message: 'Failed to create venue' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid venue id' })
  }

  try {
    const updatedVenue = await Venue.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true },
    )

    if (!updatedVenue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    return res.json(updatedVenue)
  } catch {
    return res.status(500).json({ message: 'Failed to update venue' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid venue id' })
  }

  try {
    const deletedVenue = await Venue.findByIdAndDelete(id)
    if (!deletedVenue) {
      return res.status(404).json({ message: 'Venue not found' })
    }

    return res.json({ success: true })
  } catch {
    return res.status(500).json({ message: 'Failed to delete venue' })
  }
})

export default router
