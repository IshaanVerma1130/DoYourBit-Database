const { Model, Sequelize } = require('sequelize');
const sequelize = require('../connection');

class User extends Model {}
User.init(
	{
		u_id: {
			type: Sequelize.DataTypes.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
		},
		u_name: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		u_email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		u_password: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
		modelName: 'User',
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = User;
