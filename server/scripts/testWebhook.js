/* eslint-env node */

import axios from 'axios'
import { Buffer } from 'node:buffer'
import process from 'node:process'

const WEBHOOK_URL = 'http://localhost:5000/api/webhooks/gmail'

/**
 * Build a mock Pub/Sub push payload.
 * @param {object} params - Params.
 * @param {string} params.emailAddress - Email address.
 * @param {string} params.historyId - History id.
 * @returns {object} Mock payload.
 */
function buildMockPubsubPayload({ emailAddress, historyId }) {
  const data = Buffer.from(
    JSON.stringify({
      emailAddress,
      historyId,
    }),
    'utf8',
  ).toString('base64')

  return {
    message: {
      data,
      messageId: String(Date.now()),
      publishTime: new Date().toISOString(),
    },
    subscription: 'projects/mock-project/subscriptions/mock-subscription',
  }
}

/**
 * Test the Gmail webhook endpoint with a mock Pub/Sub message.
 * @returns {Promise<void>} Nothing.
 */
async function testWebhook() {
  try {
    console.log('[testWebhook] Sending mock Pub/Sub notification to:', WEBHOOK_URL)

    const payload = buildMockPubsubPayload({
      emailAddress: 'test@example.com',
      historyId: String(Date.now()),
    })

    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
      validateStatus: () => true,
    })

    console.log('[testWebhook] Response status:', response.status)
    console.log('[testWebhook] Response body:', response.data)
  } catch (error) {
    const status = error?.response?.status
    const data = error?.response?.data

    console.error('[testWebhook] Request failed', {
      message: error && error.message ? error.message : String(error),
      status: status || null,
      response: data || null,
    })

    process.exitCode = 1
  }
}

testWebhook()
