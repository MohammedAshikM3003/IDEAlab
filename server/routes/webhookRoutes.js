import express from 'express'

import webhookController from '../controllers/webhookController.js'

const router = express.Router()

router.post('/gmail', (req, res) => webhookController.handlePubSubNotification(req, res))
router.get('/health', (req, res) => webhookController.healthCheck(req, res))

export default router
