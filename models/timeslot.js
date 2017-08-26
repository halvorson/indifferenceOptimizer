module.exports = function(sequelize, DataTypes) {
	var Timeslot = sequelize.define("timeslot", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		campaignId: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		starttime: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		endtime: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		duration: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true
			}
		},
		assigned: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		userId: {
			type: DataTypes.INTEGER
		}
	}, {
		classMethods: {
			associate: function(models) {
				timeslot.hasOne(model.campaign),
				timeslot.hasOne(model.user)
			}
		}
	});
	return Timeslot;
}