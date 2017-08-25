var ef = {};

var testObjects = [['a','b','c','d'],
{
	1:{1:['a','b','c','d']},
	2:{1:['a','b','c'],2:['c']},
	3:{1:['a','b','c']},
	4:{1:['b']},
	5:{1:['a']},
	6:{1:['d']},
	7:{1:[]}
}];


ef.assignAppointments = function(appointmentArray, preferenceObject) {
	var victoryConditions = false;
	var assignmentObject = {};
	while (!victoryConditions) {
		var empty = appointmentArray.length;
		var reserved = 0;

		//Preemptive nuke, because why not
		preferenceObject = emptyPopper(preferenceObject);
		var userArr = Object.keys(preferenceObject);
		var i = 0;
		while (empty > reserved) {
			//console.log(userArr[i]);
			if(getCountOfLowestRank(preferenceObject[userArr[i]]) === 1) {
				//Assigns person to appointment
				var lowestRank = lowestNonEmptyRank(preferenceObject[userArr[i]]);
				var chosenAppointment = preferenceObject[userArr[i]][lowestRank][0]
				console.log("Assigned user: " + userArr[i] + " to appointment: " + chosenAppointment);
				assignmentObject[chosenAppointment] = userArr[i];
				empty--;

				//Removes winner from preference object (and userArr)
				delete preferenceObject[userArr[i]];
				//Nukes all references to that appointment
				preferenceObject = preferencePopper(preferenceObject, chosenAppointment); 
				//Removes all people from object if need be
				preferenceObject = emptyPopper(preferenceObject);
				//Cleans user array to remove removed users
				userArr = userCleaner(userArr,preferenceObject);
				//Removes appointment from list
				appointmentArray = appointmentPopper(appointmentArray, chosenAppointment);

				//Starts from top, in order to grab any people that only have one choice remaining
				i = 0;
				reserved = 0;
			} else {
				reserved++; 
				i++;
			}
		}
		//console.log(assignmentObject);

		//Build array of people yet to be assigned (and remaining preferences)
		var promisedPrefs = {};
		for (var j = 0; j<empty; j++) {
			promisedPrefs[userArr[j]] = {}
			promisedPrefs[userArr[j]][1] = preferenceObject[userArr[j]][lowestNonEmptyRank(preferenceObject[userArr[j]])];
		}
		//console.log(promisedPrefs);

		assignRemaining();
		victoryConditions = true;
		console.log(assignmentObject);
	}

	//This needs to be nested because it's modifying these variables
	//Also, this is definitely not the smartest way to do this (brute-force depth-first search)
	function assignRemaining() {
		// Save state in case we need to backtrack (need to clone object)
		// Declared locally since each recursion will have one of these
		var ssPromisedPrefs = JSON.parse(JSON.stringify(promisedPrefs));
		var ssAssignmentObject = JSON.parse(JSON.stringify(assignmentObject));
		var ssUserArr = userArr.slice(0);

		// If we've assigned everybody, we're done!
		if(Object.keys(promisedPrefs).length === 0 ) {
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

				if(assignRemaining()) {
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