module.exports = function(mongoose) {
  var collection = 'users';
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    mail: String,
    name: String,
    username: String,
    trips: [],
    joined: Date,
    updated: Date,
    editable: Boolean
  });

  return mongoose.model(collection, schema);
};