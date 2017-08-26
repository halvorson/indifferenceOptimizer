//var calendar = require("../models/calendar.js");
var db = require("../models");

module.exports = function(app) {

	app.get("/", function(req, res) {
		res.render("index");
	});

	app.get("/calendar", function(req, res) {
		//calendar();
		//res.render("calendar_month", {monthDates:calendar()});
	});

	app.get("/wizard", function(req, res) {
		res.render("wizard");
	});

	app.get("/wizard/:campaign", function(req, res) {
		db.timeslot.findAll({
			where: {
				campaignId: req.params.campaign
			}
		}).then(function(timeslots) {
			db.campaign.findAll({
				where: {
					id: req.params.campaign
				}
			}).then(function(campaigns) {
				var timeslotArray = [];
				for (var i = 0; i< timeslots.length; i++) {
					timeslotArray.push(timeslots[i].dataValues);
				}
				//console.log(timeslotArray);
				var hbsObject = {
					appointments: timeslotArray,
					campaignId: req.params.campaign,
					campaign: campaigns[0]
				};
				res.render("wizard2", hbsObject);
			});
		});
	});

	app.get("/campaign/:campaign", function(req, res) {
		db.timeslot.findAll({
			where: {
				campaignId: req.params.campaign
			}
		}).then(function(timeslots) {
			db.campaign.findAll({
				where: {
					id: req.params.campaign
				}
			}).then(function(campaigns) {
				var timeslotArray = [];
				for (var i = 0; i< timeslots.length; i++) {
					timeslotArray.push(timeslots[i].dataValues);
				}
				//console.log(timeslotArray);
				var hbsObject = {
					appointments: timeslotArray,
					campaignId: req.params.campaign,
					campaign: campaigns[0]
				};
				res.render("chooser", hbsObject);
			});
		});
	});

	app.get("/optimize/:campaign", function(req, res) {
		db.campaign.findAll({
			where: {
				id: req.params.campaign
			}
		}).then(function(campaigns) {
			db.preference.aggregate('userId', 'count', 
				{ distinct: true ,
					where: {
						campaignId: req.params.campaign
					}
				}).then(function(count) {
					var hbsObject = {
						campaignId: req.params.campaign,
						campaign: campaigns[0],
						usersSubmitted: count
					};
					res.render("optimize", hbsObject);
				});
			});
	});

	app.get("/results/:campaign", function(req, res) {
		db.timeslot.findAll({
			where: {
				campaignId: req.params.campaign
			}
		}).then(function(timeslots) {
			db.campaign.findAll({
				where: {
					id: req.params.campaign
				}
			}).then(function(campaigns) {
				var timeslotAssignees = [];
				for (var i = 0; i< timeslots.length; i++) {
					var assignee = timeslots[i].dataValues.userId;
					if(assignee) {
						timeslotAssignees.push(assignee);
					}
				}
				db.user.findAll({
					where: {
						id: {$in: timeslotAssignees}
					}
				}).then(function(users) {


					var timeslotArray = [];
					for (var i = 0; i< timeslots.length; i++) {
						var timeslotData = timeslots[i].dataValues
						var assignee = timeslotData['userId'];
						if (assignee) {
							for (var j = 0; j<users.length; j++) {
								if (users[j].id === assignee) {
									timeslotData.name = users[j].name;
									timeslotData.email = users[j].email;
									break;
								}
							}
						}
						timeslotArray.push(timeslotData);
					}
					var hbsObject = {
						appointments: timeslotArray,
						campaignId: req.params.campaign,
						campaign: campaigns[0]
					};
					console.log(hbsObject);
					res.render("results", hbsObject);
				});
			});
		});
	});
}