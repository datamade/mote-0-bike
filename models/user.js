module.exports = function(mongoose) {
  var collection = 'users';
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    mail: String,
    name: {
      first: String,
      last: String
    },
    trips: [],
    joined: Date,
    updated: Date
  });

  return mongoose.model(collection, schema);
};