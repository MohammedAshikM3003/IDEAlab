import gmailWebhookService from '../services/gmail/gmailWebhookService.js'

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

var samples = [
	{
		from: 'alice@example.com',
		subject: 'Booking request for July 10',
		expected: true,
	},
	{
		from: 'noreply@service.com',
		subject: 'Booking request',
		expected: false,
	},
	{
		from: 'mailer-daemon@googlemail.com',
		subject: 'Delivery Status Notification (Failure)',
		expected: false,
	},
	{
		from: 'bob@example.com',
		subject: 'Re: Booking request',
		expected: false,
	},
	{
		from: 'alerts@team.mongodb.com',
		subject: 'Booking request',
		expected: false,
	},
	{
		from: 'carol@example.com',
		subject: 'Out of office auto-reply',
		expected: false,
	},
]

for (var i = 0; i < samples.length; i += 1) {
	var sample = samples[i]
	var message = makeMessage(sample.from, sample.subject)
	var result = gmailWebhookService.isBookingRequest(message)
	var status = result === sample.expected ? 'ok' : 'mismatch'
	console.log(status + ':', sample.from, '|', sample.subject, '|', 'result=' + result)
}
