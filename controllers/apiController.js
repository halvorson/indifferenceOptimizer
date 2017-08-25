// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");
var moment = require("moment");
var ef = require("../js/extraFunctions.js");

// Routes
// =============================================================
module.exports = function(app) {

	app.get("/api/calendar/:calId/appointments", function(req, res) {
		//console.log(db.Todo);
		// db.Todo.findAll({}).then(function(results) {
		//   res.json(results);
		// });
	});

	// POST route for adding a new block of calendar slots
	app.post("/api/calendar", function(req, res) {
		console.log(req.body);
		var globalStartTime = moment(req.body.eventDay + " " + req.body.startTime, "MM/DD/YYYY hh:mm a");
		var globalEndTime = moment(req.body.eventDay + " " + req.body.endTime, "MM/DD/YYYY hh:mm a");
		// console.log(globalStartTime.format());
		// console.log(globalEndTime.format());
		var movingMoment = globalStartTime;
		var duration = moment.duration(Number(req.body.duration), 'minutes');
		var breakDuration = moment.duration(Number(req.body.break), 'minutes');
		var breakCadence = Number(req.body.breakCadence);
		
		//Define some variables for the loop
		var appointmentNumber = 0;
		var startTimeUnix = 0;
		var endTimeUnix = 0;
		var appointmentArray = [];
		var campaignId = ef.makeid();
		//console.log(duration);

		//some sanity checks so it won't start without having the numbers filled in
		if(req.body.startTime && req.body.endTime && req.body.eventDay && req.body.duration && movingMoment.isBefore(globalEndTime)) {
			while(true) {
				//Create object, add metadata
				appointmentObject = {};
				appointmentObject.campaignId = campaignId;
				appointmentObject.duration = duration.asMinutes();

				//Save start time, add duration, save end time
				appointmentObject.starttime = movingMoment.unix();
				movingMoment.add(duration);
				appointmentObject.endtime = movingMoment.unix();

				//If a break should be taken, add that break
				if(++appointmentNumber % breakCadence === 0) {
					movingMoment.add(breakDuration);
				}

				//End loop if we run over, otherwise add to array, and start over
				if(movingMoment.isAfter(globalEndTime)) {
					break;
				} else {
					appointmentArray.push(appointmentObject);
				}
			}
		} else {
			console.log("Something fishy is going on. Check the inputs");
		}
		//console.log(appointmentArray);
		//res.json(appointmentArray[0].campaignId);
		db.timeslot.bulkCreate(appointmentArray).then(() => { 
			//console.log("/wizard/" + campaignId);
			res.json(campaignId);
		});

		//res.render("wizard2", { appointments: appointmentArray });
	});

	// DELETE route for deleting appointments during setup
	app.delete("/api/calendar/:calId", function apiDelete(req, res) {
		console.log("Deleting appointment id: " + req.params.calId);
		db.timeslot.destroy({where:
			{id:req.params.calId}
		}).then(() => {
			console.log("Deleted appointment id: " + req.params.calId);
		});
	});

	//API endpoint for launching campaign (e.g., creating user (if need be), then launching campaign)
	app.post("/api/launch", function apiLaunchCampaign(req,res) {
		console.log(req.body);
		db.user.findOrCreate({where: {email: req.body.user.email}, defaults: {name: req.body.user.name}})
		.spread((user, created) => {
			//logSequelize(user);
			var campaign = req.body.campaign;
			campaign.ownerId = user.id;
			//Add datetime
			campaign.draftDateTime = moment(campaign.draftDay + " " + campaign.draftTime, "MM/DD/YYYY hh:mm a").unix();

			db.campaign.findOrCreate({where: {id: campaign.campaignId}, defaults: {
				name: campaign.name,
				ownerId: campaign.ownerId,
				draftDateTime: campaign.draftDateTime
			}})
			.spread((campaign, created) => {
				logSequelize(campaign);
			});
		});
	});

	app.post("/api/prefs", function apiAddPrefs(req,res) {
		console.log(req.body);
		db.user.findOrCreate({where: {email: req.body.email}, defaults: {name: req.body.name}})
		.spread((user, created) => {
			logSequelize(user);
			var prefArray = [];
			var apptRanks = req.body.apptRanks;

			for (var k in apptRanks){
				if (apptRanks.hasOwnProperty(k)) {
					var prefObj = {
						userId: user.id,
						campaignId: req.body.campaignId,
						timeslotId: k,
						priority: apptRanks[k],
					}
					prefArray.push(prefObj);
				}
			}

			db.preference.bulkCreate(prefArray).then(() => { 
				res.json({message:"I'm done"});
			});
		});
	});

	// PUT route for updating todos. We can get the updated todo data from req.body
	app.put("/api/todos", function(req, res) {

	});

	function logSequelize(obj) {
		console.log(obj.get({
			plain: true
		}));
	}
};
