module.exports = function(sequelize, DataTypes) {
	var Timeslot = sequelize.define("timeslot", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		campaignId: {
			type: DataTypes.STRING,
			validate: {
				allowNull: false,
				notEmpty: true
			}
		},
		starttime: {
			type: DataTypes.INTEGER,
			validate: {
				allowNull: false,
				notEmpty: true
			}
		},
		endtime: {
			type: DataTypes.INTEGER,
			validate: {
				allowNull: false,
				notEmpty: true
			}
		},
		duration: {
			type: DataTypes.INTEGER,
			validate: {
				allowNull: false,
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