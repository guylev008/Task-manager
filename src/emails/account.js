const sgMail = require('@sendgrid/mail');
const apiKey =
	'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';

sgMail.setApiKey(apiKey);

sgMail.send({
	to: 'guylev008@gmail.com',
	from: 'guylev008@gmail.com',
	subject: 'Task App',
	text: 'This is an email from the task app'
});
