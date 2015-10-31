/*
 * app.js - Express server with routes module
 */

/*jslint  node    : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global */
'use strict';

// Set the 'development' environment configuration object
module.exports = {
  database      : 'mongodb://localhost:27017/spa',
  cookieMaxage  : 3600000,
  sessionSecret : 'vanTalk@v0.0.1',
  sessionName   : 'vanTalk',
  // nodemailer transporter configuration
  transportService  : 'your_admin_email_service_provider',
  // admin email for sending reminder info to clients
  // such as password reset link
  transportAuthUser : 'your_admin_email',
  // admin email password for app, not the login password
  transportAuthPass : 'your_admin_email_app_password'
};
