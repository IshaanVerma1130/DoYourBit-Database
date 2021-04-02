const Sequelize = require('sequelize');

const sequelize = new Sequelize('doyourbit', 'root', 'ishaan', {
	host: '127.0.0.1',
	dialect: 'mysql',
});

// Check if connection to db was established.
sequelize
	.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
	})
	.catch((err) => {
		console.error('Unable to connect to the database:', err);
	});

module.exports = sequelize;
