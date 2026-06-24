import express from 'express'

import bookingController from '../controllers/bookingController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/by-token/:token', (req, res) => bookingController.getByToken(req, res))
router.post('/form-response', (req, res) => bookingController.submitFormResponse(req, res))

router.get('/', authMiddleware, (req, res) => bookingController.list(req, res))
router.get('/availability', authMiddleware, (req, res) => bookingController.availability(req, res))
router.post('/internal', authMiddleware, (req, res) => bookingController.createInternal(req, res))
router.get('/:id', authMiddleware, (req, res) => bookingController.get(req, res))
router.patch('/:id/approve', authMiddleware, (req, res) => bookingController.approve(req, res))
router.patch('/:id/reject', authMiddleware, (req, res) => bookingController.reject(req, res))
router.patch('/:id/clarify', authMiddleware, (req, res) => bookingController.requestClarification(req, res))

export default router
