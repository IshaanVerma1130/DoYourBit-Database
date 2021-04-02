const NgoReq = require('../models/NgoReq');
const Ngo = require('../models/Ngo');
const { validationResult } = require('express-validator');

async function signup(req, res) {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ status: 'error', errors: errors.array() });
	}

	Ngo.findOne({
		where: { n_name: req.body.name },
	})
		.then((ngo) => {
			// If NGO with this name already exists, show error
			if (ngo != null) {
				res.status(409);
				return res.json({
					status: 'error',
					errors: [{ msg: 'Ngo already exists with this name' }],
				});
			}

			Ngo.findOne({
				where: { n_email: req.body.email },
			})
				.then((ngo) => {
					// If NGO name doesnot exists check for email
					if (ngo != null) {
						res.status(409);
						return res.json({
							status: 'error',
							errors: [{ msg: 'Ngo already exists with this email' }],
						});
					}

					Ngo.findOne({
						where: { address: req.body.address },
					})
						.then((ngo) => {
							// If NGO email doesnot exist check for address
							if (ngo != null) {
								res.status(409);
								return res.json({
									status: 'error',
									errors: [{ msg: 'Ngo already exists with this address' }],
								});
							}

							// If all tests pass create the NGO
							Ngo.create({
								n_email: req.body.email,
								n_password: req.body.password,
								n_name: req.body.name,
								phone: req.body.phone,
								address: req.body.address,
							})
								.then((ngo) =>
									res.json({
										status: 'success',
										ngo: {
											n_id: ngo.n_id,
											n_email: ngo.n_email,
											n_name: ngo.n_name,
											phone: ngo.phone,
											address: ngo.address,
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

async function request(req, res) {
	NgoReq.findOne({
		where: { n_id: req.body.n_id, req_id: req.params.id },
	})
		.then((n_req) => {
			// If NGO has already requested, show error
			if (n_req != null) {
				res.status(409);
				return res.json({
					status: 'error',
					errors: [{ msg: 'You have already requested' }],
				});
			}

			NgoReq.create({
				n_id: req.body.n_id,
				req_id: req.params.id,
			})
				.then((add_req) =>
					res.json({
						status: 'success',
						req_id: add_req.req_id,
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
}

async function updateAbout(req, res) {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ status: 'error', errors: errors.array() });
	}

	await Ngo.sequelize.query('UPDATE Ngo SET about = ? WHERE n_id = ?', {
		replacements: [req.body.about, req.body.n_id],
		type: Ngo.sequelize.QueryTypes.UPDATE,
	});

	res.json({
		status: 'success',
		about: req.body.about,
	});
}

async function updateAddress(req, res) {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ status: 'error', errors: errors.array() });
	}

	await Ngo.sequelize.query('UPDATE Ngo SET address = ? WHERE n_id = ?', {
		replacements: [req.body.address, req.body.n_id],
		type: Ngo.sequelize.QueryTypes.UPDATE,
	});

	res.json({
		status: 'success',
		address: req.body.address,
	});
}

async function updatePhone(req, res) {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ status: 'error', errors: errors.array() });
	}

	await Ngo.sequelize.query('UPDATE Ngo SET phone = ? WHERE n_id = ?', {
		replacements: [req.body.phone, req.body.n_id],
		type: Ngo.sequelize.QueryTypes.UPDATE,
	});

	res.json({
		status: 'success',
		phone: req.body.phone,
	});
}

module.exports = {
	signup,
	request,
	updateAbout,
	updateAddress,
	updatePhone,
};
