var express = require('express');
var mongoose = require('mongoose');
var config = require('./config.js');
var example_model = require('./models/example');

var db_uri = process.env.MONGOLAB_URI || process.env.MONGODB_URI || "mongodb://localhost";
mongoose.connect(db_uri);

var app = module.exports = express.createServer();
config(app, express);

var models = {};
models.examples = example_model(mongoose);

require('./routes')(app, models, mongoose);

app.listen(process.env.PORT || 3000);