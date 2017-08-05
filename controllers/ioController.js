var express = require("express");
var calendar = require("../models/calendar.js");

var router = express.Router();

router.get("/", function(req, res) {
  res.render("index");
});

var dummyMonthObject = [{
  weekIndex:1,
  weekDates: [
  {day:30, weekend: true},
  {day:31}, 
  {day:1},
  {day:2},
  {day:3},
  {day:4},
  {day:5, weekend: true}
  ]
}, {
  weekIndex:2,
  weekDates: [
  {day:6, weekend: true},
  {day:7}, 
  {day:8},
  {day:9},
  {day:10},
  {day:11},
  {day:12, weekend: true}
  ]
}];

router.get("/calendar", function(req, res) {
  calendar();
  res.render("calendar_month", {monthDates:calendar()});
});

// Export routes for server.js to use.
module.exports = router;