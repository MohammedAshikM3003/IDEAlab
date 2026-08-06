import mongoose from 'mongoose'

import User from '../models/User.js'

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

    if (!token || token === 'null' || token === 'undefined' || !mongoose.Types.ObjectId.isValid(token)) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await User.findById(token)

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    req.user = user
    return next()
  } catch {
    return res.status(500).json({ message: 'Authentication middleware failed' })
  }
}
