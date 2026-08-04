/**
 * Forces Gmail Watch to start on the PRODUCTION Render server
 * by calling the startWatch script directly against production env vars.
 *
 * Run: node server/scripts/forceStartWatch.js
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

console.log('='.repeat(60))
console.log('  Gmail Watch Force-Start Diagnostic (LOCAL → Google API)')
console.log('='.repeat(60))

console.log('\n📋 Env check:')
console.log('  CLIENT_ID    :', CLIENT_ID ? '✅ set' : '❌ MISSING')
console.log('  CLIENT_SECRET:', CLIENT_SECRET ? '✅ set' : '❌ MISSING')
console.log('  REDIRECT_URI :', REDIRECT_URI)
console.log('  REFRESH_TOKEN:', REFRESH_TOKEN ? `✅ set (${REFRESH_TOKEN.slice(0, 20)}...)` : '❌ MISSING')
console.log('  PROJECT_ID   :', PROJECT_ID || '❌ MISSING')

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !PROJECT_ID) {
  console.error('\n❌ Missing required env vars. Cannot continue.')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client })

const topicPath = `projects/${PROJECT_ID}/topics/gmail-booking-requests`
console.log('\n📡 Starting Gmail Watch on topic:', topicPath)

try {
  const res = await gmailClient.users.watch({
    userId: 'me',
    requestBody: {
      topicName: topicPath,
      labelIds: ['INBOX', 'UNREAD'],
      labelFilterBehavior: 'INCLUDE',
    },
  })

  const { historyId, expiration } = res.data
  const expiresAt = expiration ? new Date(Number(expiration)).toISOString() : 'unknown'

  console.log('\n✅ Gmail Watch started successfully!')
  console.log('  historyId :', historyId)
  console.log('  expiresAt :', expiresAt)
  console.log('\n  ✅ Google Cloud Pub/Sub is now connected to your Gmail inbox.')
  console.log('  Any new email to ksridealab@gmail.com will trigger a webhook to Render.')
} catch (err) {
  console.error('\n❌ Gmail Watch failed:', err.message)
  if (err.message?.includes('invalid_grant')) {
    console.error('  → The refresh token is invalid or revoked. Re-run OAuth.')
  }
  if (err.message?.includes('Topic')) {
    console.error('  → The Pub/Sub topic does not exist or service account lacks permission.')
    console.error('  → Go to Google Cloud Console → Pub/Sub → Topics and verify "gmail-booking-requests" exists.')
  }
  process.exit(1)
}
