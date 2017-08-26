module.exports = function(sequelize, DataTypes) {
	var Campaign = sequelize.define("campaign", {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING
		},
		userId: {
			type: DataTypes.INTEGER
		},
		draftDateTime: {
			type: DataTypes.INTEGER
		},
		hasLaunched: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		hasRan: {
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
		mustBeAssigned: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		unassignedUsers: {
			type: DataTypes.STRING,
		}
	}, {
		classMethods: {
			associate: function(models) {
				campaign.hasOne(models.user)
			}
		}
	});
	return Campaign;
}