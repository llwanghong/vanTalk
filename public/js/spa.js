/*
 * spa.js
 * Root namespace module
 */

/*jslint  browser : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global $, spa*/

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

var spa = (function () {
  'use strict';
  var initModule = function ( $container, $param ) {
    spa.data.initModule();
    spa.model.initModule();
    spa.shell.initModule( $container, $param );
  };

  return { initModule : initModule };

}());