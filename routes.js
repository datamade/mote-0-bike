var fs = require('fs');
var moment = require('moment');
var csv = require('fast-csv');
var simplify = require('simplify-js');

module.exports = function(app, models){

  /**
   *  Index
   */
  app.get('/', function(req, res){
    models.trips.find({}).select('start end simplified').sort('-_id').exec(function(err, trips){
      res.render('index.jade', {
        page: 'index',
        moment: moment,
        trips: trips,
        tripsjson: JSON.stringify(trips)
      });
    });
  });

  app.get('/upload', function(req, res){
    res.render('upload.jade', {
      page: 'upload'
    });
  });

  app.get('/about', function(req, res){
    res.render('about.jade', {
      page: 'about'
    });
  });


  app.get('/viewtrip/:id', function(req, res){

    //get the example
    models.trips.findById(req.params.id, function(err, trip){
      
      //render the view page
      res.render('viewtrip.jade', {
        page: 'view',
        trips: [trip],
        tripsjson: JSON.stringify([trip]),
        moment: moment
      });

    });
  });

  /**
   *  Add View
   */
  app.get('/add', function(req, res){
      //render the add page
      res.render('add.jade', {
        page: 'add'
      });
  });
  
  /*
  app.get('/clear', function(req, res){
    models.trips.find({}).remove();
    models.users.find({}).remove();
  });
  */
  
  app.post('/add', function(req, res){
    var tmp_path = req.files.csv.path;
    var stream = fs.createReadStream(tmp_path);

    var records = [ ];
    var units = {
      "ALT": "FT",
      "BEARING": "DEG",
      "TEMP": "F",
      "HUMIDITY": "RH",
      "LIGHT": "LUX"
    };
    var start_time = null;
    var end_time = null;

    // setting {headers: true} returns rows in format { ID: '', RUN_NUMBER: '' ... }

    csv(stream, { headers: true })
      .on("data", function(record){
        if(!record.RUN_NUMBER){
          // skip blank lines
          return;
        }
        delete record.ID;
        delete record.RUN_NUMBER;

        record.time = 1 * new Date( record.DATE + " " + record.TIME );
        if(!start_time){
          start_time = record.time;
        }
        end_time = record.time;
        delete record.DATE;
        delete record.TIME;
        
        record.ll = [ record.LAT * 1.0, record.LON * 1.0 ]
        delete record.LAT;
        delete record.LON;

        // move units from records to separate units array
        for(var key in record){
          var val = record[key];
          if(val === null){
            delete record[key];
          }
          else if(typeof val == "string"){
            if(val.indexOf("_") > -1){
              record[key] = 1.0 * val.substring(0, val.indexOf("_"));
              units[key] = val.substring(val.indexOf("_") + 1);
            }
            else{
              record[key] = 1.0 * val;
            }
          }
        }
        
        records.push(record);
      })
      .on("end", function(){

        var trip = new models.trips();
        trip.records = records;
        trip.start = new Date(start_time);
        trip.end = new Date(end_time);
        // move units from records to separate units array
        if(Object.keys(units).length){
          trip.units = units;
        }

        if(req.body.user){
          // attach trip to a user
          models.users.findOne({ mail: req.body.user }, function(err, user){
            if(user){
              // update existing user with new trip
              trip.user = user.id;
              trip.save(function(err){
                if(err){
                  throw err;
                }
                // show user has updated
                user.updated = new Date();
                user.trips.push({ id: trip._id, start: trip.start, end: trip.end });
                user.save(function(err){ });

                simplifytrip(trip);
                res.redirect('/viewtrip/' + trip._id);
              });
            }
            else{
              // save new user and new trip
              user = new models.users();            
              user.mail = req.body.user;
              user.save(function(err){
                trip.user = user.id;
                trip.save(function(err){
                  user.trips = [ { id: trip.id, start: trip.start, end: trip.end } ];
                  user.save(function(err){
                    simplifytrip(trip);
                    res.redirect('/user/' + user._id);
                  });
                });
              });
            }
          });
        }
        else{
          // anonymous?
          trip.save(function(err){
            if(err){
              throw err;
            }
            simplifytrip(trip);
            res.redirect('/viewtrip/' + trip._id);
          });
        }
      })
      .parse();
  });

  app.get('/users', function(req, res){
    models.users.find({}).sort('-updated').exec(function(err, users){
      res.render('leaderboard.jade', {
        page: 'users',
        users: users
      });
    });
  });

  app.get('/user/:id', function(req, res){
    models.users.findById(req.params.id, function(err, user){
      if(err){
        return err;
      }
      user.trips = user.trips.reverse(); // show newer uploads on top
      res.render('user.jade', {
        moment: moment,
        page: 'users',
        user: user,
        tripsjson: JSON.stringify(user.trips)
      });
    });
  });

  app.get('/api/trip/:id.csv', function(req, res){
    models.trips.findById(req.params.id, function(err, trip){
      var firstrow = Object.keys( trip.records[0] );
      firstrow.splice( firstrow.indexOf("ll"), 1 );
      firstrow.splice( firstrow.indexOf("time"), 1 );
      firstrow.push("LAT");
      firstrow.push("LON");
      firstrow.push("DATE");
      firstrow.push("TIME");
      res.write('"' + firstrow.join('","') + '"\r\n');
      for(var r=0;r<trip.records.length;r++){
        for(var k=0;k<firstrow.length;k++){
          if(firstrow[k] == "LAT"){
            res.write(trip.records[r].ll[0] + "");
          }
          else if(firstrow[k] == "LON"){
            res.write(trip.records[r].ll[1] + "");
          }
          else if(firstrow[k] == "DATE"){
            res.write( '"' + (new Date(trip.records[r].time)).toDateString() + '"' ) ;
          }
          else if(firstrow[k] == "TIME"){
            res.write( '"' + (new Date(trip.records[r].time)).toTimeString() + '"' ) ;
          }
          else{
            if(isNaN(trip.records[r][firstrow[k]] * 1)){
              res.write('"' + trip.records[r][firstrow[k]] + '"');
            }
            else{
              res.write(trip.records[r][firstrow[k]] + "");          
            }
          }
          if(k<firstrow.length-1){
            res.write(",");
          }
        }
        res.write('\r\n');
      }
      res.end();
    });
  });
  app.get('/api/trip/:id', function(req, res){
    models.trips.findById(req.params.id, function(err, trip){
      res.json( trip );
    });
  });
  
  var simplifytrip = function(trip){
    // generate a simplified line for the homepage, based on this trip
    var tripcopy = trip.records.concat();
    for(var r=0;r<tripcopy.length;r++){
      tripcopy[r] = { x: tripcopy[r].ll[1], y: tripcopy[r].ll[0] };
    }
    var simplified = simplify.simplify( tripcopy, 0.0001 );
    for(var r=0;r<simplified.length;r++){
      simplified[r] = [ simplified[r].y, simplified[r].x ];
    }
    trip.simplified = simplified;
    trip.save(function(err){ });
  };
  
};