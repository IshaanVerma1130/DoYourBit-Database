const express = require('express');
const { body } = require('express-validator');
const userController = require('../controller/user-controller');
const router = new express.Router();

router.post(
	'/signup',
	[
		// name must not be null
		body('name')
			.notEmpty()
			.withMessage('Name must not be empty')
			.isLength({ min: 6 })
			.withMessage('Name must be 6 characters long'),
		// email must be an valid email
		body('email').isEmail().withMessage('Enter a valid email'),
		// password must be at least 5 chars long
		body('password')
			.isLength({ min: 8 })
			.withMessage('Password must be 8 characters long'),
	],
	userController.signup
);

router.get('/donate/:id', userController.donate);

module.exports = router;
