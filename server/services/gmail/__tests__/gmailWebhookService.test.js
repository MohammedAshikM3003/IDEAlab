import assert from 'node:assert/strict'
import test from 'node:test'

import gmailWebhookService from '../gmailWebhookService.js'

function makeMessage(from, subject) {
	return {
		payload: {
			headers: [
				{ name: 'From', value: from },
				{ name: 'Subject', value: subject },
			],
		},
	}
}

process.env.GOOGLE_SENDER_EMAIL = 'ksridealab@gmail.com'

test('isBookingRequest accepts a normal booking email', () => {
	var message = makeMessage('alice@example.com', 'Booking request for July 10')
	assert.equal(gmailWebhookService.isBookingRequest(message), true)
})

test('isBookingRequest rejects self-sent email', () => {
	var message = makeMessage('ksridealab@gmail.com', 'Booking request')
	assert.equal(gmailWebhookService.isBookingRequest(message), false)
})

test('isBookingRequest rejects replies', () => {
	var message = makeMessage('alice@example.com', 'Re: Booking request')
	assert.equal(gmailWebhookService.isBookingRequest(message), false)
})

test('isBookingRequest rejects automated sender fragments', () => {
	var cases = [
		'mailer-daemon@googlemail.com',
		'noreply@service.com',
		'no-reply@service.com',
		'bounce@service.com',
		'postmaster@service.com',
		'notifications@service.com',
		'alerts@team.mongodb.com',
		'updates@mail.mongodb.com',
	]

	for (var i = 0; i < cases.length; i += 1) {
		var message = makeMessage(cases[i], 'Booking request')
		assert.equal(gmailWebhookService.isBookingRequest(message), false)
	}
})

test('isBookingRequest rejects automated subject fragments', () => {
	var cases = [
		'Delivery Status Notification (Failure)',
		'Delivery failure notice',
		'Undeliverable: Booking request',
		'Automatic Reply: Out of office',
		'Out of Office Auto-Reply',
		'Auto-Reply: Thanks',
	]

	for (var i = 0; i < cases.length; i += 1) {
		var message = makeMessage('alice@example.com', cases[i])
		assert.equal(gmailWebhookService.isBookingRequest(message), false)
	}
})
