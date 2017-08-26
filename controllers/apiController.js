// *********************************************************************************
// api-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

// Dependencies
// =============================================================

// Requiring our Todo model
var db = require("../models");
var moment = require("moment");
var ef = require("../js/extraFunctions.js");
var ef3 = require("../js/ef3.js");

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
		db.user.findOrCreate({where: {email: req.body.user.email, name: req.body.user.name}})
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
		db.user.findOrCreate({where: {email: req.body.email, name: req.body.name}})
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
	app.post("/api/optimize/:campaignId", function(req, res) {
		db.campaign.findAll({
					where: {
						id: req.params.campaignId
					}
		}).then(function(campaigns) {
			if(campaigns[0].hasRan) {
				console.log("Trying to rerun... failing");
				return;
			}
			db.preference.findAll({
				where: {
					campaignId: req.params.campaignId
				}
			}).then(function(preferences) {
				db.timeslot.findAll({
			where: {
				campaignId: req.params.campaignId
			}
				}).then(function(timeslots) {
					// logSequelize(timeslots);
					// logSequelize(preferences);
					// logSequelize(campaigns);

					var appointmentArray = [];
					var prefsObj = {};
					var mustBeAssigned = campaigns[0].mustBeAssigned || false;

					var testObjects = [['a','b','c','d','e','f','g'],
					{
						1:{1:['a','b','c']},
						2:{1:['a','b','c'],2:['c']},
						3:{1:['a']},
						4:{1:['b']},
						5:{1:['a']},
						6:{1:['d']},
						7:{1:['d']}
					}, true];

					for (var i = 0; i< timeslots.length; i++) {
						appointmentArray.push(timeslots[i].id);
					};

					// console.log(testObjects[0]);
					// console.log(appointmentArray);

					for (var i = 0; i< preferences.length; i++) {
						var pref = preferences[i];
						var userId = pref.userId;
						var priority = pref.priority;
						// logSequelize(pref);
						// console.log(prefsObj);
						//check for user
						if(!(userId in prefsObj)) {
							prefsObj[userId] = {};
						}
						// console.log(prefsObj);
						//check for pref level
						if(!(priority in prefsObj[userId])) {
							prefsObj[userId][priority] = [];
						}
						// console.log(prefsObj);
						//add
						prefsObj[userId][priority].push(pref.timeslotId);
					}
					// console.log(testObjects[1]);
					// console.log(prefsObj);

					var assignmentResults =  ef3.assignAppointments(appointmentArray, prefsObj, mustBeAssigned);
					var assignmentObject = assignmentResults.assignmentObject;
					console.log(assignmentObject);

					recursiveUpdate(assignmentObject,assignmentResults.unassignedUsers,res,req.params.campaignId);

				});
			});
		});
	});

	function recursiveUpdate(assObj, unassUsers, res, campId) {
		//If 0, update the campaign itself (and end recursion)
		if(Object.keys(assObj).length===0) {
			db.campaign.update(
				{ 
					hasRan: true,
					unassignedUsers: unassUsers.join()
				}, 
				{ where: { id: campId }} /* where criteria */
			).then(function(response) {
				res.json({success:true});
			});
		} else {
			var timeslotId = Object.keys(assObj)[0]; 
			db.timeslot.update(
				{ 
					assigned: true,
					assigneeId: Number(assObj[timeslotId])
				}, 
				{ 
					where: { id: Number(timeslotId) }
				})
			.then(function(response) {
				delete assObj[timeslotId];
				recursiveUpdate(assObj, unassUsers, res, campId);
			});
		}
	}

	function logSequelize(obj) {
		if(obj.length > 1 ) {
			for (var i = 0; i< obj.length; i++) {
				console.log(obj[i].dataValues);
			}
		} else {
			console.log(obj.get({
				plain: true
			}));
		}
		console.log(typeof obj);
	}
};
