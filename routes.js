module.exports = function(app, models, mongoose){

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
      
      //render the index page
      res.render('list.jade', {
          page: 'list',
          examples: docs
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