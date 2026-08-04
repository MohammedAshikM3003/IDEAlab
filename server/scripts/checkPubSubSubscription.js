/**
 * Checks Pub/Sub subscription configuration.
 * Verifies the push endpoint is correctly set to Render.
 *
 * Run: node server/scripts/checkPubSubSubscription.js
 */

import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })

const { google } = await import('googleapis')

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID

const EXPECTED_PUSH_ENDPOINT = 'https://idealab-backend-ad7o.onrender.com/api/webhooks/gmail'
const SUBSCRIPTION_NAME = `projects/${PROJECT_ID}/subscriptions/gmail-booking-requests`

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

const pubsub = google.pubsub({ version: 'v1', auth: oauth2Client })

console.log('='.repeat(60))
console.log('  Pub/Sub Subscription Diagnostic')
console.log('='.repeat(60))
console.log('  Checking:', SUBSCRIPTION_NAME)

try {
  const res = await pubsub.projects.subscriptions.get({ subscription: SUBSCRIPTION_NAME })
  const sub = res.data

  console.log('\n📋 Subscription found:')
  console.log('  Name        :', sub.name)
  console.log('  Topic       :', sub.topic)
  console.log('  Push config :', JSON.stringify(sub.pushConfig, null, 2))
  console.log('  Pull?       :', !sub.pushConfig?.pushEndpoint ? '⚠️  YES — This is a PULL subscription. It will NOT send to Render!' : 'No (push)')
  console.log('  Push URL    :', sub.pushConfig?.pushEndpoint || '❌ NONE SET')
  console.log('  State       :', sub.state || 'unknown')

  if (!sub.pushConfig?.pushEndpoint) {
    console.log('\n❌ PROBLEM: Subscription is PULL type — Render will never receive webhooks.')
    console.log('   Fix: Update the subscription to PUSH with endpoint:')
    console.log(`   ${EXPECTED_PUSH_ENDPOINT}`)
  } else if (sub.pushConfig.pushEndpoint !== EXPECTED_PUSH_ENDPOINT) {
    console.log('\n⚠️  WARNING: Push endpoint is WRONG.')
    console.log('   Current  :', sub.pushConfig.pushEndpoint)
    console.log('   Expected :', EXPECTED_PUSH_ENDPOINT)
  } else {
    console.log('\n✅ Push endpoint is correctly set to Render!')
  }

} catch (err) {
  console.error('\n❌ Could not fetch subscription:', err.message)
  if (err.status === 404 || err.message?.includes('NOT_FOUND')) {
    console.error('  → Subscription "gmail-booking-requests" does NOT EXIST in Google Cloud.')
    console.error('  → You need to CREATE it in Google Cloud Console → Pub/Sub → Subscriptions.')
  }
}
