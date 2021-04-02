const { Model, Sequelize } = require('sequelize');
const sequelize = require('../connection');
const NgoReq = require('./NgoReq');

class ReqType extends Model {}
ReqType.init(
	{
		req_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			unique: true,
		},
	},
	{
		sequelize,
		modelName: 'ReqType',
		freezeTableName: true,
		timestamps: false,
	}
);

ReqType.hasMany(NgoReq, {
	foreignKey: {
		name: 'req_id',
		allowNull: false,
		primaryKey: true,
	},
});
NgoReq.belongsTo(ReqType, {
	foreignKey: {
		name: 'req_id',
		allowNull: false,
		primaryKey: true,
	},
});

module.exports = ReqType;
