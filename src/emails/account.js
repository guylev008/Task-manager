const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
