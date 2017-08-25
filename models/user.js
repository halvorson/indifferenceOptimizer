module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define("user", {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		company: {
			type: DataTypes.STRING
		},
		name: {
			type: DataTypes.STRING
		},
		email: {
			type: DataTypes.STRING
		}
	});
	return User;
}