import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import { GridFSBucket, ObjectId } from 'mongodb'
import { Readable } from 'node:stream'

import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()
const BUCKET_NAME = 'facilityBannerImages'
const MAX_BANNER_FILE_SIZE = 1024 * 1024 * 10

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BANNER_FILE_SIZE },
})

const getBucket = () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('Database is not connected')
  }

  return new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME })
}

const uploadImageFromRequest = async ({ req, fieldName, sourceLabel }) => {
  if (!req.file || !req.file.buffer) {
    throw new Error(`${fieldName} image file is required`)
  }

  if (!String(req.file.mimetype || '').startsWith('image/')) {
    throw new Error('Only image uploads are supported')
  }

  const bucket = getBucket()
  const filename = `${req.user._id}-${sourceLabel}-${Date.now()}-${req.file.originalname || `${sourceLabel}.png`}`

  const uploadStream = bucket.openUploadStream(filename, {
    contentType: req.file.mimetype,
    metadata: {
      userId: req.user._id.toString(),
      source: sourceLabel,
    },
  })

  await new Promise((resolve, reject) => {
    Readable.from(req.file.buffer).pipe(uploadStream).on('error', reject).on('finish', resolve)
  })

  return {
    fileId: uploadStream.id.toString(),
    url: `/api/facilities/media/${uploadStream.id.toString()}`,
  }
}

router.post('/banner', authMiddleware, upload.single('banner'), async (req, res) => {
  try {
    const uploaded = await uploadImageFromRequest({
      req,
      fieldName: 'banner',
      sourceLabel: 'facility-banner',
    })

    return res.json({
      success: true,
      fileId: uploaded.fileId,
      url: uploaded.url,
    })
  } catch (error) {
    if (String(error?.message || '').includes('required') || String(error?.message || '').includes('Only image uploads')) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({ message: 'Failed to upload banner image' })
  }
})

router.post('/gallery', authMiddleware, upload.single('gallery'), async (req, res) => {
  try {
    const uploaded = await uploadImageFromRequest({
      req,
      fieldName: 'gallery',
      sourceLabel: 'facility-gallery',
    })

    return res.json({
      success: true,
      fileId: uploaded.fileId,
      url: uploaded.url,
    })
  } catch (error) {
    if (String(error?.message || '').includes('required') || String(error?.message || '').includes('Only image uploads')) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({ message: 'Failed to upload gallery image' })
  }
})

router.post('/equipment', authMiddleware, upload.single('equipment'), async (req, res) => {
  try {
    const uploaded = await uploadImageFromRequest({
      req,
      fieldName: 'equipment',
      sourceLabel: 'facility-equipment',
    })

    return res.json({
      success: true,
      fileId: uploaded.fileId,
      url: uploaded.url,
    })
  } catch (error) {
    if (String(error?.message || '').includes('required') || String(error?.message || '').includes('Only image uploads')) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({ message: 'Failed to upload equipment image' })
  }
})

router.get('/:id', async (req, res) => {
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

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Banner image is too large. Max size is 10MB.' })
    }

    return res.status(400).json({ message: error.message || 'Banner upload failed' })
  }

  return next(error)
})

export default router
