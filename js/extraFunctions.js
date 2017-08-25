var ef = {};

ef.makeid = function() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 8; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

var testObjects = [['a','b','c','d'],
{
	1:{1:['a','b','c','d']},
	2:{1:['a','b'],2:['c']},
	3:{1:['a']},
	4:{1:['b']},
	5:{1:['c']},
	6:{1:['d']}
}]


// ef.assignAppointments = function(appointmentArray, preferenceObject) {
// 	var victoryConditions = false;
// 	var assignmentObject = {};
// 	while (!victoryConditions) {
// 		var empty = appointmentArray.length;
// 		var reserved = 0;
// 		var userArr = Object.keys(preferenceObject);
// 		var i = 0;
// 		while (empty > reserved) {	
// 			if(preferenceObject.userArr[i].length === 1) {
// 				assignmentObject.userArray[i][0] = userArray[i];
// 				preferenceObject = appointmentPopper(preferenceObject, assignmentObject.userArray[i][0]); //removes booked appointment from all other people 
// 			} else {
// 				reserved--;
// 			}
// 		}
// 	}
// }

// function getCountOfLowestRank(prefObject) {

// }

// function appointmentPopper(preferenceObject, appointment) {
// 	preferenceObject.forEach()
// }

module.exports = ef;