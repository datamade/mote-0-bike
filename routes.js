var fs = require('fs');

module.exports = function(app, models){

  /**
   *  Index
   */
  app.get('/', function(req, res){
    if (app.requireAuth === true && req.loggedIn === false)
      res.redirect('/auth/twitter');

    //get all the examples
    models.examples.find({}, function(err, docs){
      
      //render the index page
      res.render('index.jade', {
        page: 'index',
        examples: docs
      });

    });
  });
  
  
  /**
   *  Listing
   */
  app.get('/list', function(req, res){
    if (app.requireAuth === true && req.loggedIn === false)
      res.redirect('/auth/twitter');

    //get all the examples
    models.examples.find({}, function(err, docs){
    
      models.trips.find({}, function(err, trips){
    
        //render the index page
        res.render('list.jade', {
            page: 'list',
            examples: docs,
            trips: trips
        });
      });

    });
  });
  
  app.get('/map', function(req, res){
    models.trips.find({}, function(err, trips){
      res.render('map.jade', {
        page: 'map',
        trips: trips,
        tripsjson: JSON.stringify(trips)
      });
    });
  });

  /**
   *  View
   */
  app.get('/view/:id', function(req, res){
		

    if (app.requireAuth === true && req.loggedIn === false)
      res.redirect('/auth/twitter');

    //get the example
    models.examples.findById(req.params.id, function(err, doc){
      
      //render the view page
      res.render('view.jade', {
        page: 'view',
        example: doc
      });

    });
  });


  app.get('/viewtrip/:id', function(req, res){
		

    if (app.requireAuth === true && req.loggedIn === false)
      res.redirect('/auth/twitter');

    //get the example
    models.trips.findById(req.params.id, function(err, doc){
      
      //render the view page
      res.render('viewtrip.jade', {
        page: 'view',
        trip: doc
      });

    });
  });

  /**
   *  Add View
   */
  app.get('/add', function(req, res){
    if (app.requireAuth === true && req.loggedIn === false)
      res.redirect('/auth/twitter');
      
      //render the add page
      res.render('add.jade', {
        page: 'add'
      });
  });
  
  app.post('/add', function(req, res){
    var tmp_path = req.files.csv.path;
    fs.readFile(tmp_path, { encoding: 'utf8' }, function(err, csv) {
      if(err){
        throw err;
      }

      var lines = csv.toString().split("\r\n");

      var records = [ ];
      for(var i=1;i<lines.length;i++){
        var line = lines[i].split(",");
        // 0=ID, 1=RUN_NUMBER, 2=DATE, 3=TIME, 4=LAT, 5=LON, 6=ALT, 7=BEARING, 8=MPH, 9=AIR, 10=TEMP, 11=HUMIDITY, 12=LIGHT
        if(line.length < 10){
          //console.log(line.length);
          continue;
        }
        var lat = line[4];
        var lng = line[5];
        var alt = line[6];
        var mph = line[8];
        var air = line[9];
        var temp = line[10];
        var hum = line[11];
        var light = line[12];
        records.push([ lat, lng, alt, mph, air, temp, hum, light ]);
      }

      var trip = new models.trips();
      trip.records = records;
      var firstline = lines[1].split(",");
      trip.start = new Date(firstline[2] + " " + firstline[3]);
      var lastline = lines[lines.length-1].split(",");
      trip.end = new Date(lastline[2] + " " + lastline[3]);

      trip.save(function(err){
        if(err){
          throw err;
        }
        res.redirect('/viewtrip/' + trip._id);
      });
    });
  });
  
  /**
   *  Add test doc
   */
   
  app.post('/posts', function(req, res){
     var now = new Date();
     var Post = models.examples;
     var post = new Post();
     post.name = req.param('doc');
     post.date = now;
     post.save(function(err) {
         console.log('error check');
         if(err) { throw err; }
         console.log('saved');
     });
     res.redirect('/list');
  });
  
};