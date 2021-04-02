const Express = require('express');
const sequelize = require('./connection');
const ReqType = require('./models/ReqType');

const app = Express();
app.use(Express.json());

// Routes
const ngoRoutes = require('./routes/ngo-routes');
const userRoutes = require('./routes/user-routes');
const userNgoRoutes = require('./routes/user-ngo-routes');

// User routes
app.use('/user', userRoutes);

// Ngo routes
app.use('/ngo', ngoRoutes);

// Login route for User and Ngo
app.use('/login', userNgoRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	sequelize.sync();
	console.log(`Listening on port ${port}...`);
});
