const express = require('express');
const { body } = require('express-validator');
const userNgoController = require('../controller/user-ngo-controller');
const router = new express.Router();

router.post(
	'/',
	[
		// email must be an valid email
		body('email').isEmail().withMessage('Enter a valid email'),
		// password must be at least 5 chars long
		body('password')
			.isLength({ min: 8 })
			.withMessage('Password mush be 8 characters long'),
	],
	userNgoController.login
);

module.exports = router;
