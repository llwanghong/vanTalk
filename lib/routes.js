/*
 * routes.js - express server
 * including routes for
 *   signin, signup, signout, password update and reset
 */

/*jslint  node    : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES ------------
'use strict';
var
  configRoutes,
  config      = require('./config'),
  crud        = require( './crud' ),
  chat        = require( './chat' ),
  bcrypt      = require( 'bcrypt-nodejs' ),
  passport    = require( 'passport' ),
  async       = require( 'async' ),
  nodemailer  = require( 'nodemailer' ),
  crypto      = require( 'crypto' );
// ------------  END MODULE SCOPE VARIABLES  ------------

// ------------ BEGIN PUBLIC METHODS ------------
configRoutes = function ( app, server ) {
  app.get( '/', function ( req, res ) {
    if (req.user) {
      console.log("user in session: %s", req.user.name);
    } else {
      console.log("no user in session");
    }
    if (req.user) {
      return res.render(
        'spa',
        {
          user : {
            'name'    : req.user.name,
            'id'      : req.user._id,
            'css_map' : req.user.css_map
          }
        }
      );
    } else {
      return res.render( 'spa' );
    }
  });
  
  app.post( '/signin', function ( req, res, next ) {
    passport.authenticate('local', function ( err, user, info ) {
      if (err) { return next(err); }

      if (!user) {
        // req.flash('error', info.message);
        return res.json({'error': info.message});
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }

        // req.flash('success', 'Welcome Back ' + user.name + ' !');
        return res.json({
          'user': user.name,
          'success': 1
        });
      });
    })(req, res, next);
  });

  app.post( '/signup', function( req, res, next ) {
    var user = {
      name      : req.body.username,
      email     : req.body.email,
      password  : req.body.password,
      is_online : false,
      css_map   : { "background-color" : req.body.backgroundColor }
    };

    bcrypt.hash(user.password, null, null, function( error, hash ) {
      user.password = hash;
      crud.construct(
        'users',
        user,
        function ( err, user ) {
          console.log("create user: %o", user);
          if (err) {
            // console.log('Fail to create User due to %j', err);
            return next( err );
          }
          req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.json({ 'success' : 1, 'user' : user });
          }); // end of logIn
        } // end of callback
      ); // end of construct
    }); // end of hash
  }); // end of post signup
  
  app.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  
  app.get( '/update', function ( req, res ) {
    res.render( 'update', { user: req.user } );
  });

  app.put( '/update', function( req, res, next ) {
    var
      find_map = {
        name  : req.user.name,
        email : req.user.email
      },
      update_map = {
        $set : { 'password' : req.body.password }
      };

    bcrypt.hash(update_map.$set.password, null, null, function( error, hash ) {
      update_map.$set.password = hash;
      crud.update(
        'users',
        find_map,
        update_map,
        function ( err, user ) {
          if (err) {
            console.log('Fail to update User due to %j', err);
            return next( err );
          }
          req.logIn(user[0], function(err) {
            if (err) { return next(err); }
            res.json({'success' : 1});
          }); // end of logIn
        } // end of callback
      ); // end of update
    }); // end of hash
  }); // end of post update

  app.post( '/forgot', function ( req, res, next ) {
    async.waterfall([
      function ( done ) {
        crypto.randomBytes( 20, function ( err, buf ) {
          var token = buf.toString('hex');
          done( err, token );
        });
      },
      function ( token, done ) {
        crud.update(
          'users',
          { email: req.body.email },
          { $set :
            {
              resetPasswordToken: token,
              resetPasswordExpires: Date.now() + 3600000 // 1 hour
            }
          },
          function ( err, user ) {
            if (!user) {
              // req.flash('error', 'No account with that email address exists.');
              return res.redirect('/forgot');
            }
  
            done( err, token, user[0] );
          }
        );
      },
      function ( token, user, done ) {
        var transporter, mailOptions;
        console.log("user reset: %s and %s", token, user.email);
        transporter = nodemailer.createTransport({
          service: config.transportService,
          auth: {
            user: config.transportAuthUser,
            pass: config.transportAuthPass  // client pass for app, not the login pass
          }
        });
        console.log("transporter: %o", transporter);
        mailOptions = {
          from: 'vanTalk Service <' + config.transportAuthUser + '>',
          to: user.email,
          subject: 'vanTalk Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            '<a>http://' + req.headers.host + '/reset/' + token + '</a>\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n' +
            'Best Regards,\n' +
            'vanTalk Team',
          html: '<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>' +
            '<p>Please click on the following link, or paste this into your browser to complete the process:</p>' +
            '<p><a href=http://' + req.headers.host + '/reset/' + token + '>http://' + req.headers.host +
            '/reset/' + token + '</a></p>' +
            '<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>' +
            '<p>Best Regards,</p>' +
            '<p>vanTalk Team</p>'
        };
        console.log("mailOptions: %o", mailOptions);
        transporter.sendMail(mailOptions, function (err) {
          console.log("sendmail err: %o", err);
          // req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) { return next(err); }
      return res.json({'success': 1});
    });
  });

  app.get('/reset/:token', function(req, res) {
    var token = req.params.token;
    crud.read(
      'users',
      {
        resetPasswordToken   : token,
        resetPasswordExpires : { $gt: Date.now() }
      },
      {},
      function(error, result_map) {
        var user = result_map[0];
        if (!user) {
          console.log('Password reset token is invalid or has expired.');
          // req.flash('error', 'Password reset token is invalid or has expired.');
          return res.render(
            'spa',
            {
              reset : {
                'reset'  : true,
                'token'  : token,
                'status' : 'invalid'
              }
            }
          );
        }

        return res.render(
          'spa',
          {
            reset : {
              'reset'  : true,
              'token'  : token,
              'status' : 'valid'
            }
          }
        );
      }
    );
  });

  app.post('/reset/:token', function ( req, res, next ) {
    async.waterfall([
      function (done) {
        bcrypt.hash(req.body.password, null, null, function ( err, hashedPassword ) {
          done(err, hashedPassword);
        });
      },
      function ( hashedPassword, done ) {
        crud.update(
          'users',
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          { $set :
            {
              password: hashedPassword,
              resetPasswordToken: undefined,
              resetPasswordExpires: undefined
            }
          },
          function ( err, user ) {
            if (!user[0]) {
              console.log('Password reset token is invalid or has expired.');
              // req.flash('error', 'Password reset token is invalid or has expired.');
              // return res.redirect('back');
            }
  
            done(err, user[0]);
          }
        );
      },
      function ( user, done ) {
        var smtpTransport, mailOptions;
        smtpTransport = nodemailer.createTransport({
          service: config.transportService,
          auth: {
            user: config.transportAuthUser,
            pass: config.transportAuthPass  // client pass for app, not the login pass
          }
        });
        mailOptions = {
          from: 'vanTalk Service <' + config.transportAuthUser + '>',
          to: user.email,
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n' +
            'Best Regards,\n' +
            'vanTalk Team',
          html: '<p>Hello,</p>' +
            '<p>This is a confirmation that the password for your account ' + user.email + ' has just been changed.</p>' +
            '<p>Best Regards,</p>' +
            '<p>vanTalk Team</p>'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      if (err) { return next(err); }
      return res.json({'success': 1});
    });
  });
  
  app.post( '/read', function ( req, res ) {
    var find_map = { 'name' : req.body.username };
    res.contentType( 'json' );
    if (req.body.email) {
      find_map = { 'email' : req.body.email };
    }
    crud.read(
      'users',
      find_map,
      {},
      function ( error, map_list ) {
        res.json({
          'persons': map_list,
          'count': map_list.length
        });
      }
    );
  });

  app.get( '/delete/:name', function ( req, res ) {
    crud.destroy(
      'users',
      { name: req.params.name },
      function ( result_map ) { res.send( result_map ); }
    );
  });

  chat.connect( server );
};

module.exports = { configRoutes : configRoutes };
// ------------  END PUBLIC METHODS  ------------