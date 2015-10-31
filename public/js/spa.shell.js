/*
 * spa.shell.js
 * Shell module for SPA
 */

/*jslint  browser : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global $, spa*/

spa.shell = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      anchor_schema_map : {
        chat : { opened : true, closed: true },
        profile: { on : true },
        _profile: {
          uid : { suzie : true },
          status : {
            green : true,
            red : true,
            grey : true
          }
        }
      },

      resize_interval : 200,

      // html code for signin and signup header
      sign_html : String()
        + '<div class="spa-shell-head-signin"></div>'
        + '<div class="spa-shell-head-signup"></div>',

      // html code for password reset form
      reset_html : String()
        + '<div id="spa-shell-reset">'
          + '<div class="spa-shell-reset-header">'
            + '<h2>Reset Password</h2>'
          + '</div>'
          + '<form>'
            + '<div class="spa-shell-flash-info"></div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="password">New Password</label>'
              + '<input type="password" name="password" autofocus="autofocus"/>'
            + '</div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="confirm" class="spa-shell-form-confirm-password">Confirm Password</label>'
              + '<input type="password" name="confirm"/>'
            + '</div>'
            + '<div class="spa-shell-form-submit">'
              + '<input type="submit" style="display:none"/>'
              + '<button type="button" class="reset-submit">Reset Password</button>'
              + '<button type="button" class="reset-cancel">Cancel</button>'
            + '</div>'
          + '</form>'
        + '</div>',

      main_html : String()
        + '<div class="spa-shell-head">'
          + '<div class="spa-shell-head-logo">'
            + '<h1>'
              + '<span class="spa-shell-head-prelogo">van</span>'
              + '<span class="spa-shell-head-postlogo">Talk</span>'
            + '</h1>'
          + '</div>'
          + '<div class="spa-shell-head-acct">'
            + '<div class="spa-shell-head-signin"></div>'
            + '<div class="spa-shell-head-signup"></div>'
          + '</div>'
        + '</div>'
        + '<div class="spa-shell-main">'
          + '<div class="spa-shell-main-nav"></div>'
          + '<div class="spa-shell-main-content"></div>'
        + '</div>'
        + '<div class="spa-shell-foot"></div>'
        + '<div class="spa-shell-modal"></div>'
        + '<div id="spa-shell-signup">'
          + '<div id="spa-shell-sign-header">'
            + '<h2>Create new account</h2>'
            + '<div class="spa-shell-modal-close">X</div>'
          + '</div>'
          + '<form>'
            + '<div class="spa-shell-flash-info"></div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="username">Username</label>'
              + '<input type="text" name="username" autofocus="autofocus"/>'
            + '</div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="email">Email</label>'
              + '<input type="email" name="email"/>'
            + '</div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="password">Password</label>'
              + '<input type="password" name="password"/>'
            + '</div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="confirm" class="spa-shell-form-confirm-password">Confirm Password</label>'
              + '<input type="password" name="confirm"/>'
            + '</div>'
            + '<div class="spa-shell-form-submit">'
              + '<input type="submit" style="display:none"/>'
              + '<button type="button">Signup</button>'
            + '</div>'
          + '</form>'
        + '</div>'
        + '<div id="spa-shell-signin">'
          + '<div id="spa-shell-sign-header">'
            + '<h2>Signin with account</h2>'
            + '<div class="spa-shell-modal-close">X</div>'
          + '</div>'
          + '<form>'
            + '<div class="spa-shell-flash-info"></div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="username">Username</label>'
              + '<input type="text" name="username" autofocus="autofocus"/>'
            + '</div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="password">Password</label>'
              + '<input type="password" name="password"/>'
            + '</div>'
            + '<div class="spa-shell-form-submit">'
              + '<input type="submit" style="display:none"/>'
              + '<button type="button">Signin</button>'
              + '<a href="#spa-shell-forgot">Forgot Password?</a>'
            + '</div>'
          + '</form>'
        + '</div>'
        + '<div id="spa-shell-update">'
          + '<div id="spa-shell-sign-header">'
            + '<h2>Update Password</h2>'
            + '<div class="spa-shell-modal-close">X</div>'
          + '</div>'
          + '<form>'
            + '<div class="spa-shell-flash-info"></div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="password">New Password</label>'
              + '<input type="password" name="password" autofocus="autofocus"/>'
            + '</div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="confirm" class="spa-shell-form-confirm-password">Confirm Password</label>'
              + '<input type="password" name="confirm"/>'
            + '</div>'
            + '<div class="spa-shell-form-submit">'
              + '<input type="submit" style="display:none"/>'
              + '<button type="button">Update Password</button>'
            + '</div>'
          + '</form>'
        + '</div>'
        + '<div id="spa-shell-search">'
          + '<div id="spa-shell-sign-header">'
            + '<h2>Search friends</h2>'
            + '<div class="spa-shell-modal-close">X</div>'
          + '</div>'
          + '<form>'
            + '<div class="spa-shell-flash-info"></div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="username">Username</label>'
              + '<input type="text" name="username" autofocus="autofocus"/>'
              + '<div class="spa-shell-search-icon"></div>'
            + '</div>'
            + '<div class="spa-shell-search-list"></div>'
            + '<div class="spa-shell-form-submit">'
              + '<input type="submit" style="display:none"/>'
              + '<button type="button" class="form-search">Search</button>'
              + '<button type="button" class="form-submit">Confirm</button>'
            + '</div>'
          + '</form>'
        + '</div>'
        + '<div id="spa-shell-setting">'
        + '</div>'
        + '<div id="spa-shell-forgot">'
          + '<div id="spa-shell-sign-header">'
            + '<h2>Forgot Password</h2>'
            + '<div class="spa-shell-modal-close">X</div>'
          + '</div>'
          + '<form>'
            + '<div class="spa-shell-flash-info"></div>'
            + '<div class="spa-shell-form-group">'
              + '<label for="email">Email</label>'
              + '<input type="email" name="email"/>'
            + '</div>'
            + '<div class="spa-shell-form-submit">'
              + '<input type="submit" style="display:none"/>'
              + '<button type="button">Reset Password</button>'
            + '</div>'
          + '</form>'
        + '</div>'
        + '<div id="spa-shell-overlay"></div>'
    },

    stateMap = {
      anchor_map     : {},
      resize_idto    : undefined,
      user           : null,
      invitedFriends : {},
      resetToken     : ""
    },

    jqueryMap = {},
    copyAnchorMap, getRandRgb, getRandPosition,
    setJqueryMap, changeAnchorPart,
    onResize, onHashchange,
    onLogin, onLogout,
    modalOverlay, formSignup, formSignin,
    formSearch, searchConfirm,
    formForgot, formReset, resetCancel, formUpdate,
    setChatAnchor, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //-------------------- BEGIN UTILITY METHODS -----------------
  // Returns copy of stored anchor map; minimizes overhead
  copyAnchorMap = function () {
    return $.extend( true, {}, stateMap.anchor_map );
  };

  getRandRgb = function (){
    var i,rgb_list = [];
    for ( i = 0; i < 3;i++){
      rgb_list.push( Math.floor( Math.random() * 128 )+ 160 );
    }
    return 'rgb(' + rgb_list.join(',') + ')';
  };

  getRandPosition = function (){
    return (Math.floor( Math.random() * 24 ) + 6) + 'em' ;
  };
  //--------------------- END UTILITY METHODS ------------------

  //--------------------- BEGIN DOM METHODS --------------------
  //Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;
    jqueryMap = {
      $container    : $container,
      $acct         : $container.find('.spa-shell-head-acct'),
      $nav          : $container.find('.spa-shell-main-nav'),
      $content      : $container.find('.spa-shell-main-content'),
      $signin       : $container.find('#spa-shell-signin'),
      $signinForm   : $container.find('#spa-shell-signin form'),
      $signinInfo   : $container.find('#spa-shell-signin .spa-shell-flash-info'),
      $signinBtn    : $container.find('#spa-shell-signin button'),
      $signupForm   : $container.find('#spa-shell-signup form'),
      $signupInfo   : $container.find('#spa-shell-signup .spa-shell-flash-info'),
      $signupInput  : $container.find('#spa-shell-signup .spa-shell-form-group input'),
      $signupBtn    : $container.find('#spa-shell-signup button'),
      $searchForm   : $container.find('#spa-shell-search form'),
      $searchInput  : $container.find('#spa-shell-search .spa-shell-form-group input'),
      $searchInfo   : $container.find('#spa-shell-search .spa-shell-flash-info'),
      $searchList   : $container.find('#spa-shell-search .spa-shell-search-list'),
      $searchBtn    : $container.find('#spa-shell-search .form-search'),
      $searchSubmit : $container.find('#spa-shell-search .form-submit'),
      $searchIcon   : $container.find('.spa-shell-search-icon'),
      $forgotForm   : $container.find('#spa-shell-forgot form'),
      $forgotInput  : $container.find('#spa-shell-forgot .spa-shell-form-group input'),
      $forgotInfo   : $container.find('#spa-shell-forgot .spa-shell-flash-info'),
      $forgotBtn    : $container.find('#spa-shell-forgot button'),
      $reset        : $container.find('#spa-shell-reset'),
      $resetForm    : $container.find('#spa-shell-reset form'),
      $resetInput   : $container.find('#spa-shell-reset .spa-shell-form-group input'),
      $resetInfo    : $container.find('#spa-shell-reset .spa-shell-flash-info'),
      $resetBtn     : $container.find('#spa-shell-reset .reset-cancel'),
      $resetSubmit  : $container.find('#spa-shell-reset .reset-submit'),
      $update       : $container.find('#spa-shell-update'),
      $updateForm   : $container.find('#spa-shell-update form'),
      $updateInput  : $container.find('#spa-shell-update .spa-shell-form-group input'),
      $updateInfo   : $container.find('#spa-shell-update .spa-shell-flash-info'),
      $updateBtn    : $container.find('#spa-shell-update button'),
      $overlay      : $container.find('#spa-shell-overlay')
    };
  };
  //End DOM method /setJqueryMap/

  // Begin DOM method /changeAnchorPart/
  // Purpose : Changes part of the URI anchor component
  // Arguments:
  // * arg_map - The map describing what part of the URI anchor
  // we want changed.
  // Returns : boolean
  // * true - the Anchor portion of the URI was update
  // * false - the Anchor portion of the URI could not be updated
  // Action :
  // The current anchor rep stored in stateMap.anchor_map.
  // See uriAnchor for a discussion of encoding.
  // This method
  // * Creates a copy of this map using copyAnchorMap().
  // * Modifies the key-values using arg_map.
  // * Manages the distinction between independent
  // and dependent values in the encoding.
  // * Attempts to change the URI using uriAnchor.
  // * Returns true on success, and false on failure.
  //
  changeAnchorPart = function ( arg_map ) {
    var
      anchor_map_revise = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;

    // Begin merge changes into anchor map
    KEYVAL:
    for ( key_name in arg_map ) {
      if ( arg_map.hasOwnProperty( key_name ) ) {
        // skip dependent keys during iteration
        if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // update independent key value
        anchor_map_revise[key_name] = arg_map[key_name];

        // update matching dependent key
        key_name_dep = '_' + key_name;
        if ( arg_map[key_name_dep] ) {
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        }
        else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }
    // End merge changes into anchor map

    // Begin attempt to update URI; revert if not successful
    try {
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch ( error ) {
      // replace URI with existing state
      $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
      bool_return = false;
    }

    // End attempt to update URI...
    return bool_return;
  };
  // End DOM method /changeAnchorPart/
  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  // Begin Event handler /onHashchange/
  // Purpose : Handles the hashchange event
  // Arguments:
  //   * event - jQuery event object.
  // Settings : none
  // Returns : false
  // Action :
  //   * Parses the URI anchor component
  //   * Compares proposed application state with current
  //   * Adjust the application only where proposed state
  //     differs from existing and is allowed by anchor
  //     schema.
  //
  onHashchange = function ( event ) {
    var
      anchor_map_previous = copyAnchorMap(),
      is_ok = true,
      anchor_map_proposed,
      _s_chat_previous, _s_chat_proposed, s_chat_proposed;

    // attempt to parse anchor
    try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch ( error ) {
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // convenience vars
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    // Begin adjust chat component if changed
    if ( ! anchor_map_previous
       || _s_chat_previous !== _s_chat_proposed
    ) {
      s_chat_proposed = anchor_map_proposed.chat;
      switch ( s_chat_proposed ) {
        case 'opened' :
          is_ok = spa.chat.setSliderPosition( 'opened' );
        break;
        case 'closed' :
          is_ok = spa.chat.setSliderPosition( 'closed' );
        break;
        default :
          spa.chat.setSliderPosition( 'closed' );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // End adjust chat component if changed

    // Begin revert anchor if slider change denied
    if ( ! is_ok ){
      if ( anchor_map_previous ){
        $.uriAnchor.setAnchor( anchor_map_previous, null, true );
        stateMap.anchor_map = anchor_map_previous;
      } else {
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }
    // End revert anchor if slider change denied

    return false;
  };
  // End Event handler /onHashchange/

  // Begin Event handler /onResize/
  onResize = function (){
    if ( stateMap.resize_idto ){ return true; }
    spa.chat.handleResize();
    stateMap.resize_idto = setTimeout(
      function (){ stateMap.resize_idto = undefined; },
      configMap.resize_interval
    );

    return true;
  };
  // End Event handler /onResize/

  // handle all overlay modal related affairs
  modalOverlay = function (element) {
    element.click(function ( event ) {
      var href         = element.attr('href'),
          modal        = $(href),
          overlay      = jqueryMap.$overlay,
          modal_height = modal.outerHeight(),
          modal_width  = modal.outerWidth();

      // close the modal and overlay
      overlay.click(function () {
        overlay.fadeOut(200);
        modal.css({ "display" : 'none' });
        // clean up fields in the form
        if (modal.find('form')) {
          modal.find('form').get(0).reset();
        }
        // clean up the search result
        if (href === "#spa-shell-search") {
          jqueryMap.$searchList.empty();
        } 
      });

      modal.find('.spa-shell-modal-close').click(function () {
        overlay.fadeOut(200);
        modal.css({ "display" : 'none' });
        // clean up fields in the form
        if (modal.find('form')) {
          modal.find('form').get(0).reset();
        }
        // clean up the search result
        if (href === "#spa-shell-search") {
          jqueryMap.$searchList.empty();
        } 
      });

      // add handle for forgot link in signin form
      if (href === "#spa-shell-signin") {
        modal.find('a').click(function () {
          modal.css({ "display" : 'none' });
          if (modal.find('form')) {
            modal.find('form').get(0).reset();
          }
        });
      } 

      // show the modal and overlay
      overlay.css({ "display" : 'block', "opacity" : 0 });
      overlay.fadeTo( 200, 0.5 );

      modal.css({
        "position" : 'fixed',
        "left"     : '50%',
        "top"      : '12em',
        "display"  : 'block',
        "opacity"  : 0,
        "z-index"  : 1001,
        "margin-left" : -(modal_width/2) + 'px'
      });
      
      modal.fadeTo(200, 1);
      event.preventDefault();
    });
  };

  // modal for signup
  formSignup = function (event) {
    var
      formData = jqueryMap.$signupForm.serialize(),
      password = jqueryMap.$signupInput[2].value,
      confirm  = jqueryMap.$signupInput[3].value;
    
    formData = formData + "&backgroundColor=" + getRandRgb();
    // check whether two password are the same
    if (password !== confirm) {
      jqueryMap.$signupInfo.addClass( 'flash-error' );
      jqueryMap.$signupInfo.html( 'Two typed passwords are not same !' );
      jqueryMap.$signupInfo.css({ "display" : 'block' });
      jqueryMap.$signupInfo.fadeOut(
        2000,
        function () {
          jqueryMap.$signupInfo.removeClass( 'flash-error' );
        }
      );
      
      return false;
    }

    // send signup info to server
    $.ajax({  
      type     : 'POST',      
      url      : '/signup', 
      data     : formData,  
      cache    : false,  
      dataType : 'json',  
      success  : function ( data ) {
        console.log(data);
        if (data.success) {
          jqueryMap.$signupInfo.addClass( 'flash-success' );
          jqueryMap.$signupInfo.html( 'Welcome ' + data.user.name + '!' );
          jqueryMap.$signupInfo.css({ "display" : 'block' });
          jqueryMap.$signupInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$signupInfo.removeClass( 'flash-success' );
              // location.reload();
              location.href = '/';
            }
          );
        } else {
          jqueryMap.$signupInfo.addClass( 'flash-error' );
          jqueryMap.$signupInfo.text( data.error + '!' );
          jqueryMap.$signupInfo.css({ "display" : 'block' });
          jqueryMap.$signupInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$signupInfo.removeClass( 'flash-error' );
            }
          );
        }
      }  
    });

    event.stopPropagation();
    event.preventDefault();
  };

  // modal for signin
  formSignin = function (event) {
    var formData = jqueryMap.$signinForm.serialize();
    $.ajax({  
      type     : 'POST',      
      url      : '/signin', 
      data     : formData,  
      cache    : false,  
      dataType : 'json',  
      success  : function ( data ) {
        if (data.success) {
          jqueryMap.$signinInfo.addClass( 'flash-success' );
          jqueryMap.$signinInfo.html( 'Welcome back ' + data.user + '!' );
          jqueryMap.$signinInfo.css({ "display" : 'block' });
          jqueryMap.$signinInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$signinInfo.removeClass( 'flash-success' );
              // location.reload();
              location.href = '/';
            }
          );
        } else {
          jqueryMap.$signinInfo.addClass( 'flash-error' );
          jqueryMap.$signinInfo.text( data.error + '!' );
          jqueryMap.$signinInfo.css({ "display" : 'block' });
          jqueryMap.$signinInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$signinInfo.removeClass( 'flash-error' );
            }
          );
        }
      }  
    });

    event.stopPropagation();
    event.preventDefault();
  };

  // search modal handler
  // find your friend by name
  formSearch = function (event) {
    var formData = jqueryMap.$searchForm.serialize();
    $.ajax({  
      type     : 'POST',      
      url      : '/read', 
      data     : formData,  
      cache    : false,  
      dataType : 'json',  
      success  : function ( data ) {
        var html = String(),
          i, count, friend, css_map;

        if (data.count > 0) {
          for (i = 0, count = data.count; i < count; i++) {
            friend = data.persons[i];
            css_map = friend.css_map["background-color"];
            stateMap.invitedFriends[friend.name] = "";

            html +=
              '<div class="person_info">' +
                '<div class="person_avatar" style="background-color: ' +
                  css_map + '"></div>' +
                '<div class="person_name" _id="' +
                  friend._id + '">' +
                  friend.name +
                '</div>' +
                '<div class="friend_apply">' +
                  'Add' +
                '</div>' +
              '</div>';
          }

          jqueryMap.$searchList.html( html );
          jqueryMap.$searchList.css({ "display" : 'block' });

          // handler for adding or remove friends into/from invitation buffer
          jqueryMap.$searchList.find('.friend_apply').click(
            function () {
              var friend, id, bg_color,
                self = $(this),
                text = self.text();

              friend = self.parent().find('.person_name').text();
              id = self.parent().find('.person_name').attr('_id');
              bg_color = self.parent().find('.person_avatar').css('background-color');

              if (text === 'Add') {
                stateMap.invitedFriends[friend] = {
                  'id' : id,
                  'css_map' : {'background-color' : bg_color}
                };
                self.text('Remove');
                self.css( {'background' : 'url(/image/remove.svg) no-repeat center center'} );
              } else {
                stateMap.invitedFriends[friend] = '';
                self.text('Add');
                self.css( {'background' : 'url(/image/add.svg) no-repeat center center'} );
              }
            }
          );

        } else {
          html += 'Sorry, cannot find person match your search !';
          jqueryMap.$searchList.addClass( 'flash-warning' );
          jqueryMap.$searchList.html( html );
          jqueryMap.$searchList.css({
            "display"     : 'block',
            'height'      : '3.8em',
            'line-height' : '3.8em'
          });
          jqueryMap.$searchList.fadeOut(
            2000,
            function () {
              jqueryMap.$searchList.css({
                'height'      : 'auto',
                'line-height' : 'normal'
              });
              jqueryMap.$searchList.removeClass( 'flash-warning' );
            }
          );
        }
      }  
    });

    event.stopPropagation();
    event.preventDefault();
  };

  // send invitation to friends in invitation buffer
  searchConfirm = function (event) {
    // send invitation to chat_model
    spa.model.chat.invite_friend({
      'inviter' : {
        'name' : stateMap.user.name,
        'id' : stateMap.user.id,
        'css_map' : {
          'background-color' : stateMap.user.css_map['background-color']
        }
      },
      'invited' : stateMap.invitedFriends
    });

    $('#spa-shell-search .spa-shell-search-list').css( {'display' : 'none'} );
    $('#spa-shell-search .spa-shell-modal-close').click();
    stateMap.invitedFriends = {};
    event.stopPropagation();
    event.preventDefault();
  };

  // forgot modal handler
  // the handler will first check the email has been registered
  // the it will final send the reset link to the email
  formForgot = function (event) {
    var formData = jqueryMap.$forgotForm.serialize();
    $.ajax({  
      type     : 'POST',      
      url      : '/read', 
      data     : formData,  
      cache    : false,  
      dataType : 'json',  
      success  : function ( data ) {
        if (data.count > 0) {
          $.ajax({  
            type     : 'POST',      
            url      : '/forgot', 
            data     : formData,  
            cache    : false,  
            dataType : 'json',  
            success  : function ( data ) {
              if (data.success) {
                jqueryMap.$forgotInfo.addClass( 'flash-success' );
                jqueryMap.$forgotInfo.html( 'Please check your email for reset link !' );
                jqueryMap.$forgotInfo.css({ "display" : 'block' });
                jqueryMap.$forgotInfo.fadeOut(
                  2000,
                  function () {
                    jqueryMap.$forgotInfo.removeClass( 'flash-success' );
                    $('#spa-shell-forgot .spa-shell-modal-close').click();
                  }
                );
              } else {
                jqueryMap.$forgotInfo.addClass( 'flash-error' );
                jqueryMap.$forgotInfo.html( 'Fail to send reset link, please contact Admin !' );
                jqueryMap.$forgotInfo.css({ "display" : 'block' });
                jqueryMap.$forgotInfo.fadeOut(
                  2000,
                  function () {
                    jqueryMap.$forgotInfo.removeClass( 'flash-error' );
                  }
                );
              }
            }  
          });

        } else {
          jqueryMap.$forgotInfo.addClass( 'flash-warning' );
          jqueryMap.$forgotInfo.html( 'Sorry, email has not been registered !' );
          jqueryMap.$forgotInfo.css({ "display" : 'block' });
          jqueryMap.$forgotInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$forgotInfo.removeClass( 'flash-error' );
            }
          );
        }
      }  
    });

    event.stopPropagation();
    event.preventDefault();
  };

  // reset password submit handler
  // the handler will first check two passwords are same
  // the it will send final password reset request to the server
  formReset = function (event) {
    var
      formData = jqueryMap.$resetForm.serialize(),
      password = jqueryMap.$resetInput[0].value,
      confirm  = jqueryMap.$resetInput[1].value;
 
    // check whether two password are the same
    if (password !== confirm) {
      jqueryMap.$resetInfo.addClass( 'flash-error' );
      jqueryMap.$resetInfo.html( 'Two typed passwords are not same !' );
      jqueryMap.$resetInfo.css({ "display" : 'block' });
      jqueryMap.$resetInfo.fadeOut(
        2000,
        function () {
          jqueryMap.$resetInfo.removeClass( 'flash-error' );
        }
      );
      
      return false;
    }

    // send update to the server
    $.ajax({  
      type     : 'POST',      
      url      : '/reset/' + stateMap.resetToken, 
      data     : formData,  
      cache    : false,  
      dataType : 'json',  
      success  : function ( data ) {
        if (data.success) {
          jqueryMap.$resetInfo.addClass( 'flash-success' );
          jqueryMap.$resetInfo.html( 'Successfully reset your password !' );
          jqueryMap.$resetInfo.css({ "display" : 'block' });
          jqueryMap.$resetInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$resetInfo.removeClass( 'flash-success' );
              jqueryMap.$reset.css( {'display' : 'none'} );
              location.href = '/';
            }
          );
        } else {
          jqueryMap.$resetInfo.addClass( 'flash-error' );
          jqueryMap.$resetInfo.html( 'Fail to reset your password, please contact Admin !' );
          jqueryMap.$resetInfo.css({ "display" : 'block' });
          jqueryMap.$resetInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$resetInfo.removeClass( 'flash-error' );
            }
          );
        }
      }  
    });

    event.stopPropagation();
    event.preventDefault();
  };

  // reset password cancel handler
  // the handler will hidden the reset form and then
  // redirect to chat page
  resetCancel = function (event) {
    location.href = '/';
    jqueryMap.$reset.css( {'display' : 'none'} );

    event.stopPropagation();
    event.preventDefault();
  };

  // update password submit handler
  // the handler will first check two passwords are same
  // the it will send final password update request to the server
  formUpdate = function (event) {
    var
      formData = jqueryMap.$updateForm.serialize(),
      password = jqueryMap.$updateInput[0].value,
      confirm  = jqueryMap.$updateInput[1].value;
  
    // check whether two password are the same
    if (password !== confirm) {
      jqueryMap.$updateInfo.addClass( 'flash-error' );
      jqueryMap.$updateInfo.html( 'Two typed passwords are not same !' );
      jqueryMap.$updateInfo.css({ "display" : 'block' });
      jqueryMap.$updateInfo.fadeOut(
        2000,
        function () {
          jqueryMap.$updateInfo.removeClass( 'flash-error' );
        }
      );
      
      return false;
    }

    // check whether two password are blank
    if (password === "") {
      jqueryMap.$updateInfo.addClass( 'flash-error' );
      jqueryMap.$updateInfo.html( 'Missing credentials !' );
      jqueryMap.$updateInfo.css({ "display" : 'block' });
      jqueryMap.$updateInfo.fadeOut(
        2000,
        function () {
          jqueryMap.$updateInfo.removeClass( 'flash-error' );
        }
      );
      
      return false;
    }

    // send update request to the server
    $.ajax({  
      type     : 'POST',      
      // _method=PUT is for methodOverride in express, this POST will
      // be handled as PUT request in server
      url      : '/update?_method=PUT',
      data     : formData,  
      cache    : false,  
      dataType : 'json',  
      success  : function ( data ) {
        if (data.success) {
          jqueryMap.$updateInfo.addClass( 'flash-success' );
          jqueryMap.$updateInfo.html( 'Successfully update your password !' );
          jqueryMap.$updateInfo.css({ "display" : 'block' });
          jqueryMap.$updateInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$updateInfo.removeClass( 'flash-success' );
              $('#spa-shell-update .spa-shell-modal-close').click();
            }
          );
        } else {
          jqueryMap.$updateInfo.addClass( 'flash-error' );
          jqueryMap.$updateInfo.html( 'Fail to update your password, please contact Admin !' );
          jqueryMap.$updateInfo.css({ "display" : 'block' });
          jqueryMap.$updateInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$updateInfo.removeClass( 'flash-error' );
            }
          );
        }
      }  
    });

    event.stopPropagation();
    event.preventDefault();
  };

  // handler for login
  onLogin = function ( event, login_user ) {
    var signin, signup;

    jqueryMap.$acct.css( {'background' : '#FFF'} );
    jqueryMap.$acct.html( configMap.sign_html );

    signin = stateMap.$container.find('.spa-shell-head-signin');
    signin.html( login_user.name );
    signin.html( '<a href="#spa-shell-update">' + login_user.name + '</a>' );
    modalOverlay(signin.find('a'));

    signup = stateMap.$container.find('.spa-shell-head-signup');
    signup.html( '<a href=/signout>Signout</a>' );
  };

  // temp comment out
  // onLogout = function ( event, logout_user ) {
  //   jqueryMap.$acct.text( 'Please sign-in' );
  // };
  //-------------------- END EVENT HANDLERS --------------------

  //---------------------- BEGIN CALLBACKS ---------------------
  // Begin callback method /setChatAnchor/
  // Example : setChatAnchor( 'closed' );
  // Purpose : Change the chat component of the anchor
  // Arguments:
  //   * position_type - may be 'closed' or 'opened'
  // Action :
  //   Changes the URI anchor parameter 'chat' to the requested
  //   value if possible.
  // Returns :
  //   * true  - requested anchor part was updated
  //   * false - requested anchor part was not updated
  // Throws : none
  //
  setChatAnchor = function ( position_type ){
    return changeAnchorPart({ chat : position_type });
  };
  // End callback method /setChatAnchor/
  //----------------------- END CALLBACKS ----------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Publicmethod /initModule/
  // Example : spa.shell.initModule( $('#app_div_id') );
  // Purpose :
  //   Directs the Shell to offer its capability to the user
  // Arguments :
  //   * $container (example: $('#app_div_id')).
  //     A jQuery collection that should represent a single DOM
  //     container
  // Action :
  //   Populates $container with the shell of the UI and then
  //   configures and initializes feature modules. The Shell is
  //   also responsible for browser-wide issues such as URI an-
  //   chor and cookie management.
  // Returns : none
  // Throws : none
  //
  initModule = function ( $container, $params ) {
    // load HTML and map jQuery collections
    stateMap.$container = $container;
    $container.html( configMap.main_html );

    // append hidden reset form by default
    $container.append( configMap.reset_html );

    setJqueryMap();

    // configure uriAnchor to use our schema
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    // configure and initialize chat feature modules
    spa.chat.configModule({
      set_chat_anchor : setChatAnchor,
      modal_overlay   : modalOverlay,
      chat_model      : spa.model.chat,
      people_model    : spa.model.people
    });

    spa.chat.initModule( jqueryMap.$container );

    // configure and initialize avatar feature module
    spa.avtr.configModule({
      chat_model   : spa.model.chat, 
      people_model : spa.model.people 
    });

    spa.avtr.initModule( jqueryMap.$nav ); 

    // Handle URI anchor change events.
    // This is done /after/ all feature modules are configured
    // and initialized, otherwise they will not be ready to handle
    // the trigger event, which is used to ensure the anchor
    // is considered on-load
    //
    $(window)
      .bind('resize', onResize)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );

    $(window)
      .bind('mousedown mousemove mouseup mouseover', spa.chat.handleDragResize());

    // bind handler for signup form
    jqueryMap.$signupBtn.bind( 'click', formSignup ); 
    jqueryMap.$signupForm.bind( 'submit', formSignup );

    // bind handler for signin form
    jqueryMap.$signinBtn.bind( 'click', formSignin ); 
    jqueryMap.$signinForm.bind( 'submit', formSignin );

    // bind handler for friend search form
    jqueryMap.$searchIcon.bind( 'click', formSearch ); 
    jqueryMap.$searchBtn.bind( 'click', formSearch );
    jqueryMap.$searchSubmit.bind( 'click', searchConfirm );
    jqueryMap.$searchSubmit.bind( 'submit', searchConfirm );
    jqueryMap.$searchForm.bind( 'submit', searchConfirm );

    // bind handler for forgot password form
    jqueryMap.$forgotBtn.bind( 'click', formForgot );
    jqueryMap.$forgotForm.bind( 'submit', formForgot );

    // bind handler for password reset form
    jqueryMap.$resetBtn.bind( 'click', resetCancel );
    jqueryMap.$resetSubmit.bind( 'click', formReset );
    jqueryMap.$resetSubmit.bind( 'submit', formReset );
    jqueryMap.$resetForm.bind( 'submit', formReset );

    // bind handler for update form
    jqueryMap.$updateBtn.bind( 'click', formUpdate );
    jqueryMap.$updateBtn.bind( 'submit', formUpdate );
    jqueryMap.$updateForm.bind( 'submit', formUpdate );

    $.gevent.subscribe( $container, 'spa-login', onLogin );
    // $.gevent.subscribe( $container, 'spa-logout', onLogout );
    
    if ($params && $params.id) {
      stateMap.user = $params;
      spa.model.people.login( $params );
      jqueryMap.$acct.empty();
      jqueryMap.$acct.css( {'background' : 'url(/image/loading.gif) no-repeat center center'} );
    }
    else {
      var signin, signup;

      // clear chat dimension info in window.name
      // current strategy is using window.name as one localstore
      // for chat dimension and status
      window.name = "";

      jqueryMap.$acct.html( configMap.sign_html );

      signin = stateMap.$container.find('.spa-shell-head-signin');
      signin.html( '<a href="#spa-shell-signin">Signin</a>' );
      modalOverlay(signin.find('a'));
      modalOverlay(jqueryMap.$signin.find('a'));

      signup = stateMap.$container.find('.spa-shell-head-signup');
      signup.html( '<a href="#spa-shell-signup">Signup</a>' );
      modalOverlay(signup.find('a'));

      // handle password reset senario
      if ($params && $params.reset) {
        stateMap.resetToken = $params.token;
        jqueryMap.$reset.css( {'display' : 'block'} );
        if ($params.status === 'invalid') {
          jqueryMap.$resetInfo.addClass( 'flash-error' );
          jqueryMap.$resetInfo.html( 'Password reset token is invalid or has expired !' );
          jqueryMap.$resetInfo.css({ "display" : 'block' });
          jqueryMap.$resetInfo.fadeOut(
            2000,
            function () {
              jqueryMap.$resetInfo.removeClass( 'flash-error' );
              location.href = '/';
            }
          );
        }
      }
    }

  };
  //End PUBLIC method /initModule/

  return { initModule : initModule };
  //------------------- END PUBLIC METHODS ---------------------
}());