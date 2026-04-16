/* eslint-env node */

import { google } from 'googleapis'
import readline from 'node:readline'
import process from 'node:process'

/**
 * Ensure required environment variables are present.
 * @param {string[]} keys - Env variable names.
 * @returns {void}
 */
function validateEnv(keys) {
	const missing = []

	for (const key of keys) {
		const value = process.env[key]
		if (!value || !String(value).trim()) {
			missing.push(key)
		}
	}

	if (missing.length > 0) {
		throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
	}
}

/**
 * Prompt for a single line from stdin.
 * @param {string} promptText - Prompt text.
 * @returns {Promise<string>} User input.
 */
function ask(promptText) {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})

		rl.question(promptText, (answer) => {
			rl.close()
			resolve(String(answer || '').trim())
		})
	})
}

/**
 * Run OAuth authorization flow and print refresh/access tokens.
 * @returns {Promise<void>} Nothing.
 */
async function main() {
	try {
		validateEnv(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'])

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_REDIRECT_URI,
		)

		const scopes = [
			'https://www.googleapis.com/auth/gmail.modify',
			'https://www.googleapis.com/auth/gmail.send',
			'https://www.googleapis.com/auth/gmail.labels',
		]

		const authUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			prompt: 'consent',
			scope: scopes,
		})

		console.log('\nOpen this URL in your browser and authorize the app:\n')
		console.log(authUrl)
		console.log('')

		const code = await ask('Paste the authorization code here: ')
		if (!code) {
			throw new Error('Authorization code is required')
		}

		const tokenResponse = await oauth2Client.getToken(code)
		const tokens = tokenResponse && tokenResponse.tokens ? tokenResponse.tokens : {}

		console.log('\nOAuth tokens received:\n')
		console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token || ''}`)
		console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token || ''}`)
		console.log('\nAdd the values above to your .env file.')

		if (!tokens.refresh_token) {
			console.log('\nNo refresh token was returned.')
			console.log('Tip: revoke app access in your Google account and run this script again with prompt=consent.')
		}
	} catch (error) {
		console.error('\nFailed to retrieve OAuth tokens:', error && error.message ? error.message : String(error))
		process.exitCode = 1
	}
}

main()

