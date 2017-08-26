module.exports = function(sequelize, DataTypes) {
	var Preference = sequelize.define("preference", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.INTEGER,
			validate: {
				allowNull: false,
				notEmpty: true
			}
		},
		campaignId: {
			type: DataTypes.STRING
		},
		timeslotId: {
			type: DataTypes.INTEGER,
			validate: {
				allowNull: false,
				notEmpty: true
			}
		},
		priority: {
			type: DataTypes.INTEGER,
			validate: {
				allowNull: false,
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