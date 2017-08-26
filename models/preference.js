module.exports = function(sequelize, DataTypes) {
	var Preference = sequelize.define("preference", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.INTEGER
		},
		campaignId: {
			type: DataTypes.STRING
		},
		timeslotId: {
			type: DataTypes.INTEGER
		},
		priority: {
			type: DataTypes.INTEGER
		},
		assigned: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		classMethods: {
			associate: function(models) {
				preference.hasOne(models.user),
				preference.hasOne(models.campaign),
				preference.hasOne(models.timeslot)
			}
		}
	});
	return Preference;
}