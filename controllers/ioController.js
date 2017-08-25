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
			//console.log(timeslots);
			//console.log(timeslots.length);
			var timeslotArray = [];
			for (var i = 0; i< timeslots.length; i++) {
				timeslotArray.push(timeslots[i].dataValues);
			}
			//console.log(timeslotArray);
			var hbsObject = {
				appointments: timeslotArray,
				campaignId: req.params.campaign
			};
			res.render("wizard2", hbsObject);
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



	app.post("/api/todos", function(req, res) {
		db.todo.create(req.body)
		.then(function(results) {
			res.json(results)
		});
	});
}