const sgMail = require('@sendgrid/mail');
const apiKey =
	'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';

sgMail.setApiKey(apiKey);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'guylev008@gmail.com',
		subject: 'Thanks for joining in!',
		text: `Welcome to the app, ${name}.`
	});
};

const cancelationEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'guylev008@gmail.com',
		subject: 'Hope you will come again',
		text: `Hi ${name}, hope to see you back again`
	});
};

module.exports = {
	sendWelcomeEmail,
	cancelationEmail
};
