var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');

var trip_model = require('./models/trip');
var user_model = require('./models/user');

var db_uri = process.env.MONGOLAB_URI || process.env.MONGODB_URI || "mongodb://localhost/mote0bike";
mongoose.connect(db_uri);

var app = module.exports = express.createServer();
config(app, express);

var models = {};
models.trips = trip_model(mongoose);
models.users = user_model(mongoose);

require('./routes')(app, models);

app.listen(process.env.PORT || 3000);
console.log('app running on port ' + (process.env.PORT || 3000));