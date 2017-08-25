module.exports = function(sequelize, DataTypes) {
	var Campaign = sequelize.define("campaign", {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING
		},
		ownerId: {
			type: DataTypes.INTEGER
		},
		draftDateTime: {
			type: DataTypes.INTEGER
		},
		hasLaunched: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		authRequired: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		domainMatchRequired: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		requiredDomain: {
			type: DataTypes.STRING
		},
	});
	return Campaign;
}