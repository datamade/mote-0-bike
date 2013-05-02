module.exports = function(mongoose) {
  var collection = 'trips';
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    start: Date,
    end: Date,
    records: [ ],
    user: String,
    units: Object,
    simplified: [ ]
  });

  return mongoose.model(collection, schema);
};