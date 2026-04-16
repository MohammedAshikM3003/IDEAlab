import process from 'node:process'

/**
 * Gmail + Google Forms API configuration.
 *
 * Uses OAuth2 refresh token flow for server-to-server access.
 *
 * Required env vars (only required when Gmail features are used):
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI
 * - GOOGLE_REFRESH_TOKEN
 */

/** @type {any|null} */
let google = null
/** @type {any|null} */
let oauth2Client = null
/** @type {any|null} */
let gmail = null
/** @type {any|null} */
let forms = null

/**
 * Check whether required env vars are present.
 * @param {string[]} keys - Env var keys.
 * @returns {{ok:boolean, missing:string[]}} Result.
 */
function checkRequiredEnv(keys) {
  const missing = []

  for (const key of keys) {
    const value = process.env[key]
    if (!value || !String(value).trim()) {
      missing.push(key)
    }
  }

  return { ok: missing.length === 0, missing }
}

/**
 * Initialize the googleapis clients if possible.
 *
 * This initializer is defensive: it will not throw during import time.
 * Callers should handle `gmail === null` / `oauth2Client === null`.
 *
 * @returns {Promise<void>} Nothing.
 */
async function init() {
  if (gmail || oauth2Client || forms) {
    return
  }

  try {
    const mod = await import('googleapis')
    google = mod.google
  } catch (error) {
    console.warn('[gmail config] googleapis is not installed/available. Gmail features are disabled.', {
      message: error && error.message ? error.message : String(error),
    })
    return
  }

  const envCheck = checkRequiredEnv([
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'GOOGLE_REFRESH_TOKEN',
  ])

  if (!envCheck.ok) {
    console.warn('[gmail config] Missing env vars for Gmail integration. Gmail features are disabled.', {
      missing: envCheck.missing,
    })
    return
  }

  try {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })

    oauth2Client.on('tokens', (tokens) => {
      try {
        const hasAccessToken = Boolean(tokens && tokens.access_token)
        const hasRefreshToken = Boolean(tokens && tokens.refresh_token)
        const expiresIn =
          tokens && typeof tokens.expiry_date === 'number'
            ? Math.max(0, Math.round((tokens.expiry_date - Date.now()) / 1000))
            : null

        if (hasAccessToken || hasRefreshToken) {
          console.info('[gmail config] OAuth tokens refreshed', {
            at: new Date().toISOString(),
            accessTokenUpdated: hasAccessToken,
            refreshTokenUpdated: hasRefreshToken,
            expiresInSeconds: expiresIn,
          })
        }
      } catch (logErr) {
        console.warn('[gmail config] Failed to log token refresh event', {
          at: new Date().toISOString(),
          error: logErr && logErr.message ? logErr.message : String(logErr),
        })
      }
    })

    gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    forms = google.forms({ version: 'v1', auth: oauth2Client })
  } catch (error) {
    console.error('[gmail config] Failed to initialize Gmail clients. Gmail features are disabled.', {
      message: error && error.message ? error.message : String(error),
    })

    oauth2Client = null
    gmail = null
    forms = null
  }
}

// Attempt initialization at import time (non-fatal).
await init()

export { gmail, forms, oauth2Client, google }

