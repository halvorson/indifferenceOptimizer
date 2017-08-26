module.exports = function(sequelize, DataTypes) {
	var Timeslot = sequelize.define("timeslot", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		campaignId: {
			type: DataTypes.STRING
		},
		starttime: {
			type: DataTypes.INTEGER
		},
		endtime: {
			type: DataTypes.INTEGER
		},
		duration: {
			type: DataTypes.INTEGER
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