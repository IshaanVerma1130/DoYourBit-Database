const { Model } = require('sequelize');
const sequelize = require('../connection');

class NgoReq extends Model {}
NgoReq.init(
	{},
	{
		sequelize,
		modelName: 'NgoReq',
		freezeTableName: true,
		timestamps: false,
	}
);

module.exports = NgoReq;
