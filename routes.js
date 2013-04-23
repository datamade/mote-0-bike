var fs = require('fs');
var moment = require('moment');

module.exports = function(app, models){

  /**
   *  Index
   */
  app.get('/', function(req, res){
    res.render('index.jade', {
      page: 'index'
    });
  });
  
  app.get('/map', function(req, res){
    models.trips.find({}).select('_id').exec(function(err, trips){
      res.render('map.jade', {
        page: 'map',
        trips: trips,
        tripsjson: JSON.stringify(trips)
      });
    });
  });


  app.get('/viewtrip/:id', function(req, res){

    //get the example
    models.trips.findById(req.params.id, function(err, trip){
      
      //render the view page
      res.render('viewtrip.jade', {
        page: 'view',
        trips: [trip],
        tripsjson: JSON.stringify([trip])
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
    fs.readFile(tmp_path, { encoding: 'utf8' }, function(err, csv) {
      if(err){
        throw err;
      }

      var lines = csv.toString().split("\r\n");

      var records = [ ];
      var latmin = 90;
      var latmax = -90;
      var lngmin = 180;
      var lngmax = -180;
      for(var i=1;i<lines.length;i++){
        var line = lines[i].split(",");
        // 0=ID, 1=RUN_NUMBER, 2=DATE, 3=TIME, 4=LAT, 5=LON, 6=ALT, 7=BEARING, 8=MPH, 9=AIR, 10=TEMP, 11=HUMIDITY, 12=LIGHT
        if(line.length < 3){
          continue;
        }

        latmin = Math.min(latmin, line[4]);
        latmax = Math.max(latmax, line[4]);
        lngmin = Math.min(lngmin, line[5]);
        lngmax = Math.max(lngmax, line[5]);
        
        var record = {
          time: 1 * new Date( line[2] + " " + line[3] ),
          ll: [line[4] * 1.0, line[5] * 1.0],
          alt: line[6] || null,
          bear: line[7] || null,
          mph: line[8] || null,
          air: line[9] || null,
          temp: line[10] || null,
          hum: line[11] || null,
          lux: line[12] || null
        };
        for(var key in record){
          var val = record[key];
          if(val === null){
            delete record[key];
          }
          else if(typeof val == "string"){
            if(val.indexOf("_") > -1){
              record[key] = 1.0 * val.substring(0, val.indexOf("_"));
            }
            else{
              record[key] = 1.0 * val;
            }
          }
        }
        records.push(record);
      }

      var trip = new models.trips();
      trip.records = records;
      var firstline = lines[1].split(",");
      trip.start = new Date(firstline[2] + " " + firstline[3]);
      var lastline = lines[lines.length-1].split(",");
      trip.end = new Date(lastline[2] + " " + lastline[3]);

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
          res.redirect('/viewtrip/' + trip._id);
        });
      }
    });
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
      res.render('user.jade', {
        moment: moment,
        page: 'users',
        user: user,
        tripsjson: JSON.stringify(user.trips)
      });
    });
  });

  app.get('/api/trip/:id', function(req, res){
    models.trips.findById(req.params.id, function(err, trip){
      res.json( trip );
    });
  });
  
};