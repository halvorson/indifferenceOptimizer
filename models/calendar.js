var moment = require("moment");

var calendar = function(dayInMonth) {
	console.log("I'm alive");
	var referenceDate = dayInMonth || moment();
	console.log(referenceDate.format());
	var beginningOfCal = referenceDate.clone().startOf('month').startOf('week');
	var endOfCal = referenceDate.clone().endOf('month').endOf('week');
	console.log("Beginning of Cal: " + beginningOfCal.format());
	console.log("End of cal: " + endOfCal.format());
	var refMonth = referenceDate.month();

	var monthlyCalendar = [];
	var loopDate = beginningOfCal.clone();

	var weeksInMonth = Math.ceil(endOfCal.diff(beginningOfCal, 'week'));
	console.log(weeksInMonth);

	for (var j = 0; j<=weeksInMonth; j++) {
		var weekCalendar = {};
		weekCalendar.weekIndex = j;
		var weekDates = [];
		for (var i = 0; i < 7; i++) {
			day = {};
			day.day = loopDate.date();
			if(i==0 || i==6) {
				day.weekend = true;
			}
			if(day.day > 7&&j===0) {
				day.month = -1;
			} else if (j>1 && day.day < 7) {
				day.month = 1;
			} else {
				day.month = 0;
				day.inMonth = true;
			}
			day.moment = loopDate.format();
			loopDate.add(1, 'd');
			weekDates.push(day);
		}
		weekCalendar.weekDates = weekDates;
		monthlyCalendar.push(weekCalendar);
		console.log(weekCalendar);
	} 
	//console.log(monthlyCalendar);
	return monthlyCalendar;
};

module.exports = calendar;