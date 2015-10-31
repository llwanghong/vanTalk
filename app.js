/*
 * app.js - Express server with routes module
 */

/*jslint  node    : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global */

/*
 * comment for jslint options
 *
 * browser : true -- allow browser keywords like document, history, clearInterval and so on
 * continue : true -- allow the continue statement
 * devel : true -- allow development keywords like alert, console, and so forth
 * indent : 2 -- expect two-space indentation
 * maxerr : 50 -- abort JSLint after 50 errors
 * newcap : true -- tolerate leading underscores
 * newmen : true -- tolerate uncapitalized constructors
 * plusplus : true -- tolerate ++ and --
 * regexp : true -- allow useful but potentially dangerous regular expression constructions
 * sloppy : true -- don't require the 'use strict;' pragma
 * vars : false -- don't allow multiple var statements per functional scope
 * white : true -- disable JSLint's formatting checks
 *
 */
// ------------ BEGIN GLOBAL SCOPE VARIABLES ------------
DBHANDLE = null;
MONGOID = null;
// ------------ END GLOBAL SCOPE VARIABLES ------------

// ------------ BEGIN MODULE SCOPE VARIABLES ------------
'use strict';

var
  Sessions       = null,
  Users          = null,
  routes         = null,
  config         = require('./lib/config'),
  http           = require( 'http' ),
  assert         = require( 'assert' ),
  path           = require( 'path' ),
  logger         = require( 'morgan' ),
  express        = require( 'express' ),
  bodyParser     = require( 'body-parser' ),
  cookie         = require( 'cookie-parser' ),
  session        = require( 'express-session' ),
  errorHandler   = require( 'errorhandler' ),
  mongoStore     = require( 'connect-mongo' )( session ),
  methodOverride = require( 'method-override' ),
  flash          = require( 'express-flash' ),
  bcrypt         = require( 'bcrypt-nodejs' ),
  passport       = require( 'passport' ),
  LocalStrategy  = require( 'passport-local' ).Strategy,
  mongodb        = require( 'mongodb' ),
  mongoClient    = mongodb.MongoClient,
  mongoUrl       = config.database,
  app            = express(),
  server         = http.createServer( app );

  MONGOID = mongodb.ObjectID;
// ------------  END MODULE SCOPE VARIABLES  ------------

// ------------ BEGIN CONNECT MONGODB DATEBASE --------------
mongoClient.connect( mongoUrl, function ( error, database ) {
  assert.equal( null, error );
  assert.ok( database !== null );
  DBHANDLE = database;  
  Sessions = database.collection("sessions");
  Users    = database.collection("users");

  console.log( '** Connected to MongoDB **' );

  // view engine setup
  app.set('views', path.join(__dirname, 'public'));
  app.set('view engine', 'jade');

  // ------------ BEGIN SERVER CONFIGURATION ------------
  app.use(function (req, res, next) {
    next();
  });
  app.use( logger('dev') );
  app.use( bodyParser.json() );
  app.use( bodyParser.urlencoded({ extended: false }) );
  app.use( methodOverride('_method') );
  app.use( cookie() );
  app.use( session({
    cookie : {maxAge: config.cookieMaxage},
    secret : config.sessionSecret,
    name   : config.sessionName,
    resave : true,
    saveUninitialized : true,
    store : new mongoStore({ db : DBHANDLE, collection: "sessions" })
  }) );
  app.use( passport.initialize() );
  app.use( passport.session() );
  app.use( flash() );

  // load routers
  routes = require( './lib/routes' );
  routes.configRoutes( app, server );

  app.use( express.static(path.join(__dirname, '/public')) );
  app.use( express.static(path.join(__dirname, '/public/js')) );
  app.use( express.static(path.join(__dirname, '/public/js/jq')) );
  app.use( express.static(path.join(__dirname, '/public/css')) );

  // Get port from environment and store in Express.
  app.set('port', process.env.PORT || config.port);

  // configure passport strategies
  passport.serializeUser(function (user, done) { // serialize user
    done(null, user._id);
  });

  passport.deserializeUser(function (_id, done) { // descerialize user
    Users.findOne({_id: MONGOID(_id)}, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({ usernameField: 'username' }, function(username, password, done) {
    var criteria = (username.indexOf('@') === -1) ? {name: username} : {email: username};
    Users.findOne(criteria, function ( err, user ) {
      if (!user) {
        console.log('User not Found.');
        return done(null, false, { message: 'User Name or Email ' + username + ' does not exist!'});
      }

      bcrypt.compare(password, user.password, function(err, isMatch) {
        if (isMatch) {
          console.log('Passed Correct.');
          return done(null, user);
        } else {
          console.log('Password Incorrect.');
          return done(null, false, { message: 'Password Incorrect!' });
        }
      });
    });
  }));
  // ------------  END SERVER CONFIGURATION  ------------

  // ------------- BEGIN START SERVER -------------
  // take care this should be server rather than app
  server.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode',
                app.get('port'), app.get('env'));
  });
  // -------------  END START SERVER  -------------

  // ------------ BEGIN ERROR HANDLER -------------
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers
  app.use(function(err, req, res, next) {
    if (res.headerSet) {
      return next(err);
    }
    err.status = 500;
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use( errorHandler() );
  }

  // ------------ END ERROR HANDLER -------------
});
// ------------ END CONNECT MONGODB DATEBASE --------------
