var ef3 = {};

var testObjects = [['a','b','c','d','e','f','g'],
{
	1:{1:['a','b','c']},
	2:{1:['a','b','c'],2:['d']},
	3:{1:['a']},
	4:{1:['b']},
	5:{1:['a']},
	6:{1:['d']},
	7:{1:['d']}
}, true];


ef3.assignAppointments = function(appointmentArray, preferenceObject, mustBeAssigned) {

	var victoryConditions = false;
	var assignmentObject = {};
	var reserved = 0;
	var i = 0;
	var promisedSlots = [];

	//Needed to figure out who was unassigned (if all users are assigned and there are empty appointment slots, they'll remain in appointmentArray)
	var unassignedUsers = [];
	var ssPrefObj = JSON.parse(JSON.stringify(preferenceObject));

	//Preemptive nuke, because why not
	preferenceObject = emptyPopper(preferenceObject);
	var userArr = Object.keys(preferenceObject);

	//Here's the big shuffle; this assigns draft order for the rest of the time. Comment out to debug.
	userArr = shuffle(userArr);
	var userArrOrder = userArr.slice(0);
	console.log("Draft order: " + userArrOrder);
	console.log(preferenceObject);

	if(typeof mustBeAssigned == 'boolean' && mustBeAssigned) {
		if(userArr.length > appointmentArray.length) {
			return {error: "If all people must be assigned, there must be more appointments than people"};
		}
	}
	//Two victory conditions: user module is empty, or appointmentArray is empty
	while (userArr.length>0 && appointmentArray.length>0) {
		


		var lowestRank = lowestNonEmptyRank(preferenceObject[userArr[i]])
		var lowestRankLength = getCountOfLowestRank(preferenceObject[userArr[i]])

		// console.log("_______________________________________");
		// console.log("Looping at " + userArr[i]);
		// console.log("Preferences are: ")
		// console.log(preferenceObject[userArr[i]]);

		//If they have a specific preference that's open, assign person to appointment
		
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

		// console.log("People in queue: " + reserved);
		// console.log("# of slots awaited: " + promisedSlots.length + ", slots are " + promisedSlots);

		//If we have promised the same number of people waiting as slots they are waiting for, begin assigning process
		if((reserved === promisedSlots.length && reserved > 0) || reserved === userArr.length) {
			// console.log("_______________________________________");
			// console.log("Queue full. Assigning...");

			//Create object with just the people who were promised slots
			var promisedPrefs = {};
			for (var j = 0; j<reserved; j++) {
				promisedPrefs[userArr[j]] = {};
				promisedPrefs[userArr[j]][1] = preferenceObject[userArr[j]][lowestNonEmptyRank(preferenceObject[userArr[j]])];
			}

			//Assigns all singles so they can skip the tree later
			assignSingles();

			//Assigns all remaining users
			depthFirstAssigner();

			//A little cleanup; nukes all assigned rooms from users preferences, then cleans user array
			//Note: no need to clean the appointmentArray, as that is done in the depthFirstAssigner
			for (var k in assignmentObject){
				if (assignmentObject.hasOwnProperty(k)) {
					preferenceObject = preferencePopper(preferenceObject, k); 
				}
			}
			preferenceObject = emptyPopper(preferenceObject);

			//I lose the 'real' userArr somewhere in the depthFirst, so just redefining it based on original order
			userArr = [];
			for (var l = 0; l < userArrOrder.length; l++) {
				if (preferenceObject.hasOwnProperty(userArrOrder[l])) {
					userArr.push(userArrOrder[l]);
				}
			}

			resetAfterAssigning();
		}



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

	//Find people who were not assigned; add them to 
	for (var key in ssPrefObj) {
		if (!ssPrefObj.hasOwnProperty(key)) continue;
		var found = false;
		for (var assKey in assignmentObject) {
			if (!assignmentObject.hasOwnProperty(assKey)) continue;
			if(assignmentObject[assKey] === key) {
				found = true;
				break;
			}
		}
		if(!found) {
			unassignedUsers.push(key);
		}
	}

	//If people must be assigned (and there are unassigned people), create new elements with unassigned users and remaining appointments, then rerun the program
	if(mustBeAssigned && unassignedUsers.length>0) {
		var unassignedPrefs = {};
		for (var l = 0; l<unassignedUsers.length; l++) {
			var unassignedUserObj = {
				'1': []
			};
			for (var m = 0; m<appointmentArray.length; m++) {
				unassignedUserObj[1].push(appointmentArray[m]);
			}
			unassignedPrefs[unassignedUsers[l]] = unassignedUserObj;
		}
		var missingAssignmentObj = ef3.assignAppointments(appointmentArray, unassignedPrefs).assignmentObject;
		//
		//console.log(missingAssignmentObj);

		//Add newly assigned users to assignmentObject and blank out unassigned users
		for (var key in missingAssignmentObj) {
			if (!missingAssignmentObj.hasOwnProperty(key)) continue;
			assignmentObject[key] = missingAssignmentObj[key];
			unassignedUsers = [];
		}
	}

	// console.log(assignmentObject);
	// console.log(unassignedUsers);

	var returnObj = {};
	returnObj.assignmentObject = assignmentObject;
	returnObj.unassignedUsers = unassignedUsers;

	return returnObj;

	function resetAfterAssigning() {
		i = 0;
		reserved = 0;
		promisedSlots = [];
		//reportRemaining();
	}

	function reportRemaining() {
		console.log("Remaining: " + userArr.length + " users, " + appointmentArray.length + " appointments");
	}

	function assignSingles() {
		for (var key in promisedPrefs) {
			if (!promisedPrefs.hasOwnProperty(key)) continue;
			if (promisedPrefs[key][1].length === 1) {
				chosenAppointment = promisedPrefs[key][1][0];

				assignmentObject[chosenAppointment] = key;
				//console.log(chosenAppointment);
				//console.log(promisedPrefs[key]);

				// console.log("Assigning singular preference user " + key + " to appointment " + chosenAppointment);

				//Removes winner from preference object (and userArr)
				delete preferenceObject[key];
				delete promisedPrefs[key];

				//Nukes all references to that appointment
				promisedPrefs = preferencePopper(promisedPrefs, chosenAppointment); 
				//Cleans user array to remove removed users
				userArr = userCleaner(userArr,promisedPrefs);
				//Removes appointment from list
				appointmentArray = appointmentPopper(appointmentArray, chosenAppointment);
			}
		}
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
			// console.log("Found a local solution:")
			// console.log(assignmentObject);
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

			//console.log("Trying assigning user " + ssUserArr[0] + " to appointment " + chosenAppointment);

			if(chosenAppointment) {

				//Choose first option (if exists), assign it, do cleanup as before				
				assignmentObject[chosenAppointment] = userArr[0];

				//Removes winner from preference object (and userArr)
				delete promisedPrefs[userArr[0]];
				delete preferenceObject[userArr[0]];
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

		//console.log("Rewinding from " + userArr[0]);
		//console.log(promisedPrefs);
		return false;
	}
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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

console.log(ef3.assignAppointments(testObjects[0], testObjects[1], testObjects[2]));

// console.log(testObjects[1]);
// console.log(emptyPopper(appointmentPopper(testObjects[1],'c')));

//console.log(getCountOfLowestRank(testObjects[1][7]));

//appointmentPopper(testObjects[1],'c');

module.exports = ef3;