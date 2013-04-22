var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var example_model = require('./models/example');
var trip_model = require('./models/trip');

var db_uri = process.env.MONGOLAB_URI || process.env.MONGODB_URI || "mongodb://localhost/mote0bike";
mongoose.connect(db_uri);

var app = module.exports = express.createServer();
config(app, express);

var models = {};
models.examples = example_model(mongoose);
models.trips = trip_model(mongoose);

require('./routes')(app, models, mongoose);

app.listen(process.env.PORT || 3000);
console.log('app running');