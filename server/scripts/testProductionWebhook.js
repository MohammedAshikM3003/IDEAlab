/**
 * Tests the PRODUCTION webhook endpoint at Render.
 * Run: node server/scripts/testProductionWebhook.js
 */

import axios from 'axios'
import { Buffer } from 'node:buffer'

const PRODUCTION_URL = 'https://idealab-backend-ad7o.onrender.com'

async function check(label, url, options = {}) {
  try {
    console.log(`\n🔍 [${label}] Calling: ${url}`)
    const res = await axios({ url, timeout: 60000, validateStatus: () => true, ...options })
    console.log(`   Status : ${res.status}`)
    console.log(`   Body   :`, JSON.stringify(res.data, null, 2))
    return res
  } catch (err) {
    console.error(`   ❌ Failed: ${err.message}`)
    return null
  }
}

async function run() {
  console.log('='.repeat(60))
  console.log('  IDEAlab Production Diagnostic')
  console.log(`  Target: ${PRODUCTION_URL}`)
  console.log('='.repeat(60))

  // 1. Basic health
  await check('API Health', `${PRODUCTION_URL}/api/health`)

  // 2. Webhook health
  await check('Webhook Health', `${PRODUCTION_URL}/api/webhooks/health`)

  // 3. Fire a mock Pub/Sub push notification (simulates Google sending one)
  const mockData = Buffer.from(
    JSON.stringify({ emailAddress: 'ksridealab@gmail.com', historyId: String(Date.now()) }),
    'utf8'
  ).toString('base64')

  const mockPayload = {
    message: {
      data: mockData,
      messageId: String(Date.now()),
      publishTime: new Date().toISOString(),
    },
    subscription: 'projects/ksrceidealab/subscriptions/gmail-booking-requests',
  }

  await check(
    'Mock Pub/Sub POST',
    `${PRODUCTION_URL}/api/webhooks/gmail`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: mockPayload,
    }
  )

  console.log('\n' + '='.repeat(60))
  console.log('  Done. Check Render Logs for full processing output.')
  console.log('='.repeat(60))
}

run()
