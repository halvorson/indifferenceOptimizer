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
			type: DataTypes.STRING,
			validate: {
				allowNull: false,
				notEmpty: true
			}
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true, 
			}
		}
	});
	return User;
}