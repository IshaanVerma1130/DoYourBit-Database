const User = require('../models/User');
const NgoReq = require('../models/NgoReq');
const { validationResult } = require('express-validator');

async function signup(req, res) {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ status: 'error', errors: errors.array() });
	}

	User.findOne({
		where: { u_name: req.body.name },
	})
		.then((user) => {
			// If User already exists, show error
			if (user != null) {
				res.status(409);
				return res.json({
					status: 'error',
					errors: [{ msg: 'Username taken' }],
				});
			}

			User.findOne({
				where: { u_email: req.body.email },
			})
				.then((user) => {
					// If User name doesnot exists check for email
					if (user != null) {
						res.status(409);
						return res.json({
							status: 'error',
							errors: [{ msg: 'Email already exists' }],
						});
					}

					User.create({
						u_name: req.body.name,
						u_email: req.body.email,
						u_password: req.body.password,
					})
						.then((user) =>
							res.json({
								status: 'success',
								user: {
									u_id: user.u_id,
									u_email: user.u_email,
									u_name: user.u_name,
								},
							})
						)
						.catch((err) => {
							console.log(err);
							res.status(500);
							res.json({
								status: 'error',
								errors: [{ msg: 'Internal server error' }],
							});
						});
				})
				.catch((err) => {
					console.log(err);
					res.status(500);
					res.json({
						status: 'error',
						errors: [{ msg: 'Internal server error' }],
					});
				});
		})
		.catch((err) => {
			console.log(err);
			res.status(500);
			res.json({
				status: 'error',
				errors: [{ msg: 'Internal server error' }],
			});
		});
}

async function donate(req, res) {
	const ngos = await NgoReq.sequelize.query(
		'SELECT n_id,n_name,address,phone,about FROM Ngo WHERE n_id IN (SELECT n_id FROM NgoReq WHERE req_id = ?)',
		{ replacements: [req.params.id], type: NgoReq.sequelize.QueryTypes.SELECT }
	);

	res.json({
		status: 'success',
		ngo: ngos,
	});
}

module.exports = {
	signup,
	donate,
};
