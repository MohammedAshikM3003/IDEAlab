import express from 'express'
import mongoose from 'mongoose'

import Venue from '../models/Venue.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

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
  const payload = req.body || {}
  if (!String(payload.name || '').trim()) {
    return res.status(400).json({ message: 'Facility name is required' })
  }

  try {
    const createdVenue = await Venue.create({
      ...payload,
      name: String(payload.name).trim(),
      updatedAt: new Date(),
    })

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
