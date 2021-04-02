const User = require('../models/User');
const Ngo = require('../models/Ngo');
const { validationResult } = require('express-validator');

async function login(req, res) {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ status: 'error', errors: errors.array() });
	}

	User.findOne({
		where: { u_email: req.body.email, u_password: req.body.password },
	})
		.then((user) => {
			// If user by this email exists return user id
			if (user != null) {
				res.status(200);
				return res.json({
					status: 'success',
					u_id: user.u_id,
					u_name: user.u_name,
					type: 'user',
				});
			}

			Ngo.findOne({
				where: { n_email: req.body.email, n_password: req.body.password },
			})
				.then((ngo) => {
					// If ngo by this email exists return ngo id
					if (ngo != null) {
						res.status(200);
						return res.json({
							status: 'success',
							n_id: ngo.n_id,
							address: ngo.address,
							n_name: ngo.n_name,
							n_email: ngo.n_email,
							about: ngo.about,
							phone: ngo.phone,
							type: 'ngo',
						});
					} else if (ngo === null) {
						res.status(404);
						return res.json({
							status: 'error',
							errors: [{ msg: 'User not found' }],
						});
					}
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

module.exports = { login };
