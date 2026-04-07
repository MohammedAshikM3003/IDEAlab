import express from 'express'

import SecurityActivity from '../models/SecurityActivity.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const activity = await SecurityActivity.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10)

    return res.json(activity)
  } catch {
    return res.status(500).json({ message: 'Failed to fetch security activity' })
  }
})

export default router
