var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var moment = require("moment");

var app = express();
var port = process.env.PORT || 5000;

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));


// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Importing sequelize models
var db = require("./models");

// Set Handlebars.
var exphbs = require("express-handlebars");

// Customize handlebars with helpers
var MomentHandler = require("handlebars.moment");

var hbs =  exphbs.create({
	defaultLayout: 'main',
	helpers: {
        formatDate: function (date, format) {
            return moment(date).format(format);
        }, 
        formatDateFromUnix: function (date, format) {
            return moment(date, 'X').format(format);
        },
        timeFromUnix: function(date) {
        	return moment(date, 'X').format("hh:mm a")
        }
    }
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
require("./controllers/ioController.js")(app);
require("./controllers/apiController.js")(app);

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

db.sequelize.sync().then(function() {
	app.listen(port, function() {
		console.log("App listening on PORT " + port);
	});
});