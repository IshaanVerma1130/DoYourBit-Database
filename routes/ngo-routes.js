const express = require('express');
const { body } = require('express-validator');
const ngoController = require('../controller/ngo-controller');
const router = new express.Router();

router.post(
	'/signup',
	[
		// name must be not null and 6 characters long
		body('name')
			.notEmpty()
			.withMessage('Name must not be empty')
			.isLength({ min: 6 })
			.withMessage('Name must be 6 characters long'),
		// email must be an valid email
		body('email').isEmail().withMessage('Enter a valid email'),
		// password must be at least 8 chars long
		body('password')
			.isLength({ min: 8 })
			.withMessage('Password must be 8 characters long'),
		// phone number must be og 10 digits
		body('phone')
			.isLength({ min: 10, max: 10 })
			.withMessage('Phone number less than 10 digits')
			.isNumeric()
			.withMessage('Enter a valid phone number'),
		// address is not null
		body('address').notEmpty().withMessage('Address cannot be empty'),
	],
	ngoController.signup
);

router.post('/request/:id', ngoController.request);

router.patch(
	'/update/about',
	[
		// About must be less than 500 characters
		body('about')
			.isLength({ max: 250, min: 50 })
			.withMessage('Message should be between 50 and 250 characters'),
	],
	ngoController.updateAbout
);

router.patch(
	'/update/address',
	[
		// address is not null
		body('address').notEmpty().withMessage('Address cannot be empty'),
	],
	ngoController.updateAddress
);

router.patch(
	'/update/phone',
	[
		// phone number must be og 10 digits
		body('phone')
			.isLength({ min: 10, max: 10 })
			.withMessage('Phone number less than 10 digits')
			.isNumeric()
			.withMessage('Enter a valid phone number'),
	],
	ngoController.updatePhone
);

module.exports = router;
