import express from 'express'

import Notification from '../models/Notification.js'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 })
    return res.json(notifications)
  } catch {
    return res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

router.patch('/read-all', async (_req, res) => {
  try {
    await Notification.updateMany({}, { $set: { read: true } })
    return res.json({ success: true, message: 'All notifications marked as read' })
  } catch {
    return res.status(500).json({ message: 'Failed to update notifications' })
  }
})

router.delete('/', async (_req, res) => {
  try {
    await Notification.deleteMany({})
    return res.json({ success: true })
  } catch {
    return res.status(500).json({ message: 'Failed to clear notifications' })
  }
})

router.patch('/:id/read', async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    return res.json(updated)
  } catch {
    return res.status(500).json({ message: 'Failed to update notification' })
  }
})

export default router
