var ef = {};

var testObjects = [['a','b','c','d'],
{
	1:{1:['a','b','c']},
	2:{1:['a','b','c'],2:['c']},
	3:{1:['a','b']},
	4:{1:['b']},
	5:{1:['a']},
	6:{1:['d']},
	7:{1:[]}
}];


ef.assignAppointments = function(appointmentArray, preferenceObject) {
	var victoryConditions = false;
	var assignmentObject = {};
	var empty = appointmentArray.length;
	var reserved = 0;

	//Preemptive nuke, because why not
	preferenceObject = emptyPopper(preferenceObject);
	var userArr = Object.keys(preferenceObject);
	var i = 0;
	var promisedSlots = [];
	//Two victory conditions: user module is empty, or appointmentArray is empty
	while (empty > reserved && userArr.length>0 && appointmentArray.length>0) {
		


		var lowestRank = lowestNonEmptyRank(preferenceObject[userArr[i]])
		var lowestRankLength = getCountOfLowestRank(preferenceObject[userArr[i]])

		// console.log("_______________________________________");
		// console.log("Looping at " + userArr[i]);
		// console.log("Preferences are: ")
		// console.log(preferenceObject[userArr[i]]);

		//If they have a specific preference that's open, assign person to appointment
		if(lowestRankLength === 1) {
			var chosenAppointment = preferenceObject[userArr[i]][lowestRank][0]
			console.log("_______________________________________")
			console.log("Assigning " + chosenAppointment + " to " + userArr[i]);
			
			
			//console.log("Assigned user: " + userArr[i] + " to appointment: " + chosenAppointment);
			assignmentObject[chosenAppointment] = userArr[i];
			empty--;

			//Removes winner from preference object (and userArr)
			delete preferenceObject[userArr[i]];
			//Nukes all references to that appointment
			preferenceObject = preferencePopper(preferenceObject, chosenAppointment); 
			//Removes empty top priorities from object if need be
			preferenceObject = emptyPopper(preferenceObject);
			//Cleans user array to remove users with no remaining priorities 
			userArr = userCleaner(userArr,preferenceObject);
			//Removes appointment from list
			appointmentArray = appointmentPopper(appointmentArray, chosenAppointment);

			resetAfterAssigning();
		} else {
			//Build array of promised slots; if length of array of potentially assigned slots = reserved, run depthFirstAssigner
			var prefsInLowestRank = preferenceObject[userArr[i]][lowestRank];
			// console.log(userArr[i] + " wants one of " + prefsInLowestRank);
			for(var j = 0; j< lowestRankLength; j++) {
				var iterSlot = prefsInLowestRank[j];
				// console.log(iterSlot);
				if(!promisedSlots.includes(iterSlot)) {
					// console.log(iterSlot + " is net new. Adding");
					promisedSlots.push(iterSlot);
				}
			}
			reserved++; 
			i++;
			if(reserved === promisedSlots.length) {
				console.log("_______________________________________");
				console.log("Assigning some indifferent people:");
				var promisedPrefs = {};
				for (var j = 0; j<reserved; j++) {
					promisedPrefs[userArr[j]] = {};
					promisedPrefs[userArr[j]][1] = preferenceObject[userArr[j]][lowestNonEmptyRank(preferenceObject[userArr[j]])];
				}

				depthFirstAssigner();

				//A little cleanup; nukes all assigned rooms from users preferences, then cleans user array
				//Note: no need to clean the appointmentArray, as that is done in the depthFirstAssigner
				for (var k in assignmentObject){
					if (assignmentObject.hasOwnProperty(k)) {
						preferenceObject = preferencePopper(preferenceObject, k); 
					}
				}

				//I lose userArr somewhere in the depthFirst, so just redefining it
				preferenceObject = emptyPopper(preferenceObject);
				userArr = Object.keys(preferenceObject);

				resetAfterAssigning();
			}
		}

		console.log("People in queue: " + reserved);
		console.log("After # of slots: " + promisedSlots.length + ", slots are " + promisedSlots);

		//console.log(assignmentObject);

		//Build array of people yet to be assigned (and remaining preferences)
		// var promisedPrefs = {};
		// for (var j = 0; j<empty; j++) {
		// 	promisedPrefs[userArr[j]] = {};
		// 	promisedPrefs[userArr[j]][1] = preferenceObject[userArr[j]][lowestNonEmptyRank(preferenceObject[userArr[j]])];
		// }
		// //console.log(promisedPrefs);

		// depthFirstAssigner();
	}
	victoryConditions = true;
	console.log(assignmentObject);

	function resetAfterAssigning() {
		i = 0;
		reserved = 0;
		promisedSlots = [];
		reportRemaining();
	}

	function reportRemaining() {
		console.log("Remaining: " + userArr.length + " users, " + appointmentArray.length + " appointments");
	}

	//This needs to be nested because it's modifying these variables
	//Also, this is definitely not the smartest way to do this (brute-force depth-first search)
	function depthFirstAssigner() {
		// Save state in case we need to backtrack (need to clone object)
		// Declared locally since each recursion will have one of these
		var ssPromisedPrefs = JSON.parse(JSON.stringify(promisedPrefs));
		var ssAssignmentObject = JSON.parse(JSON.stringify(assignmentObject));
		var ssUserArr = userArr.slice(0);

		// If we've assigned everybody, we're done!
		if(Object.keys(promisedPrefs).length === 0 ) {
			console.log("Found a local solution:")
			console.log(assignmentObject);
			return true;
		}

		// If somebody who has been promised a spot has no remaining options, we've failed!!!
		if(promisedPrefs[userArr[0]][1].length === 0) {
			return false;
		}

		// console.log("_______________________________________")
		// console.log("Testing " + userArr[0] + ". Promised Prefs: " + JSON.stringify(promisedPrefs));

		
		for (var k = 0; k<ssPromisedPrefs[ssUserArr[0]][1].length ; k++) {
			
			var chosenAppointment = ssPromisedPrefs[ssUserArr[0]][1][k];

			console.log("Trying " + ssUserArr[0] + " in " + chosenAppointment);

			if(chosenAppointment) {

				//Choose first option, assign it, do cleanup as before
				
				assignmentObject[chosenAppointment] = userArr[0];

				//Removes winner from preference object (and userArr)
				delete promisedPrefs[userArr[0]];
				//Nukes all references to that appointment
				promisedPrefs = preferencePopper(promisedPrefs, chosenAppointment); 
				//Cleans user array to remove removed users
				userArr = userCleaner(userArr,promisedPrefs);
				//Removes appointment from list
				appointmentArray = appointmentPopper(appointmentArray, chosenAppointment);

				if(depthFirstAssigner()) {
					return true;
				}

				// Resets objects (important for loops above)
				promisedPrefs = JSON.parse(JSON.stringify(ssPromisedPrefs));
				assignmentObject = JSON.parse(JSON.stringify(ssAssignmentObject));
				userArr = ssUserArr.slice(0);
			}
		}

		console.log("Rewinding from " + userArr[0]);
		//console.log(promisedPrefs);
		return false;
	}
}


function userCleaner(userArr, prefObj) {
	for (var j= 0; j<userArr.length; j++) {
		if(!(userArr[j] in prefObj)) {
			userArr.splice(j--,1);
		}
	}
	return userArr;
}

function getCountOfLowestRank(individualPreferenceObject) {
	individualPreferenceObjectKeys = Object.keys(individualPreferenceObject).sort(function(a, b){return a-b});
	for (var j = 0; j<individualPreferenceObjectKeys.length; j++) {
		if(individualPreferenceObject[individualPreferenceObjectKeys[j]].length > 0) {
			return individualPreferenceObject[individualPreferenceObjectKeys[j]].length;
		}
	}
	return 0;
}

function lowestNonEmptyRank(individualPreferenceObject) {
	individualPreferenceObjectKeys = Object.keys(individualPreferenceObject).sort(function(a, b){return a-b});
	for (var j = 0; j<individualPreferenceObjectKeys.length; j++) {
		if(individualPreferenceObject[individualPreferenceObjectKeys[j]].length > 0) {
			return individualPreferenceObjectKeys[j];
		}
	}
	return 0;

}

function preferencePopper(preferenceObject, appointment) {
	for (var key in preferenceObject) {
		if (!preferenceObject.hasOwnProperty(key)) continue;

		var appointmentsAtRank = preferenceObject[key];
		for (var prop in appointmentsAtRank) {
			if(!appointmentsAtRank.hasOwnProperty(prop)) continue;

			for (var j = 0; j< appointmentsAtRank[prop].length; j++) {
				if(appointmentsAtRank[prop][j] === appointment) {
					appointmentsAtRank[prop].splice(j, 1);
				}
			}
		}
	}

	return preferenceObject;
}

function appointmentPopper(appointmentArray, appointment) {
	var index = appointmentArray.indexOf(appointment);
	if (index > -1) {
		appointmentArray.splice(index, 1);
	}
	return appointmentArray
}

function emptyPopper(preferenceObject) {
	for (var key in preferenceObject) {
		if(getCountOfLowestRank(preferenceObject[key]) === 0) {
			delete preferenceObject[key];
		}
	}
	return preferenceObject;
}

function winnerPopper(prefObj, userArr, index) {
	delete preferenceObject[userArr[index]];
	userArr.splice(index,1);
	var obj = {};
	obj.prefObj = prefObj;
	obj.userArr = userArr;
	return obj;
}

ef.assignAppointments(testObjects[0], testObjects[1]);

// console.log(testObjects[1]);
// console.log(emptyPopper(appointmentPopper(testObjects[1],'c')));

//console.log(getCountOfLowestRank(testObjects[1][7]));

//appointmentPopper(testObjects[1],'c');