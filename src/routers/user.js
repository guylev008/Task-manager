const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, cancelationEmail } = require('../emails/account');

const router = new express.Router();
const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
			cb(new Error('Please upload only JPG, JPEG or PNG'));
		cb(undefined, true);
	}
});

router.post('/users', async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (error) {
		res.status(400).send();
	}
});

router.post('/users/logout', async (req, res) => {
	try {
		req.user.tokens = req.user.token.filter(token => token.token !== req.token);
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send();
	}
});

router.post('/users/logoutAll', async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send();
	}
});

router.post(
	'users/me/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.send;
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'email', 'password', 'age'];
	const isValidOperation = updates.every(update =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation)
		return res.status(400).send({ error: 'Invalid update' });

	try {
		const user = req.user;
		updates.forEach(update => (user[update] = req.body[update]));
		await user.save();
		res.send(user);
	} catch (error) {
		res.status(400).send(error);
	}
});

router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove();
		cancelationEmail(req.user.email, req.user.name);
		res.send(req.user);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.delete('/users/me/avatar', auth, async (req, res) => {
	try {
		req.user.avatar = undefined;
		await req.user.save();
		res.send();
	} catch (error) {
		res.status(500).send(error);
	}
});

router.get('/users/:id/avatar', auth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user || !user.avatar) throw new Error();

		res.set('Content-Type', 'image/png');
		res.send(user.avatar);
	} catch (error) {
		res.status(404).send();
	}
});

module.exports = router;
