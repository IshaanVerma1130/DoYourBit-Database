const { Model, Sequelize } = require('sequelize');
const sequelize = require('../connection');
const NgoReq = require('./NgoReq');

class Ngo extends Model {}
Ngo.init(
	{
		n_id: {
			type: Sequelize.DataTypes.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true,
		},
		n_name: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		n_email: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		n_password: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		address: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		phone: {
			type: Sequelize.BIGINT,
			allowNull: false,
			unique: true,
		},
		about: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
	},
	{
		sequelize,
		modelName: 'Ngo',
		freezeTableName: true,
		timestamps: false,
	}
);

Ngo.hasMany(NgoReq, {
	foreignKey: {
		name: 'n_id',
		allowNull: false,
		primaryKey: true,
	},
});
NgoReq.belongsTo(Ngo, {
	foreignKey: {
		name: 'n_id',
		allowNull: false,
		primaryKey: true,
	},
});

module.exports = Ngo;
