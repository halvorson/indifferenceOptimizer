module.exports = function(sequelize, DataTypes) {
	var Preference = sequelize.define("preference", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		campaignId: {
			type: DataTypes.STRING
		},
		timeslotId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		priority: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true
			}
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