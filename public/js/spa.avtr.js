/*
 * spa.avtr.js
 * Avatar feature module for SPA
 */

/*jslint  browser : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global $, spa */

/* main_html processing: ^(\s*)(<.*) -> $1+ '$2' */

spa.avtr = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {

      settable_map : {
        chat_model   : true,
        people_model : true
      },

      chat_model   : null,
      people_model : null
    },

    stateMap = {
      drag_map      : null,
      $drag_target  : null,
      drag_bg_color : undefined
    },

    jqueryMap = {},

    getRandRgb, getRandPosition,
    setJqueryMap,
    onTapNav, onHeldstartNav,
    onHeldmoveNav, onHeldendNav,
    onSetchatee, onListchange,
    onUserupdate, onStatusupdate,
    onAcceptinvite, onInviteresponse,
    onLogout,
    configModule, initModule;
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------
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
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function ( $container ) {
    jqueryMap = { $container : $container };
  };
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  // only the current user can update its own avatar color scheme.
  // cannot update friends' color scheme. can only their avatar
  // position info in your own panel
  onTapNav = function ( event ){
    var css_map, person_id, bg_color,
      user = configMap.people_model.get_user(),
      userID = user ? user._id : user,
      $target = $( event.elem_target ).closest('.spa-avtr-box');

    if ( configMap.people_model.get_user() ) {}
    if ( $target.length === 0 ) { return false; }
    
    person_id = $target.attr( 'data-id' );
    bg_color  = getRandRgb();

    // only update the current user's map on tap event
    if (userID === person_id) {
      $target.css({ 'background-color' : bg_color });
      css_map = {
        'background-color' : bg_color
      };

      configMap.chat_model.update_avatar({
        relation  : 'own',
        person_id : person_id,
        friend_id : null,
        css_map   : css_map
      });

      // further update in the future as following form
      // and it will unify the avatar and chat update
      // configMap.chat_model.user_update({
      //   person_id  : person_id,
      //   update_map : {
      //     'type' : 'avatar',
      //     'data' : avatar_map
      //   }
      // });
    }
  };

  onHeldstartNav = function (event ){
    var offset_target_map, offset_nav_map,
      userID    = configMap.people_model.get_user()._id,
      $target   = $( event.elem_target ).closest('.spa-avtr-box'),
      person_id = $target.attr( 'data-id' );

    // cannot drag the current user
    if ( $target.length === 0 || userID === person_id) { return false; }

    stateMap.$drag_target = $target;
    offset_target_map = $target.offset();
    offset_nav_map    = jqueryMap.$container.offset();
    offset_target_map.top  -= offset_nav_map.top;
    offset_target_map.left -= offset_nav_map.left;
    stateMap.drag_map      = offset_target_map;
    stateMap.drag_bg_color = $target.css('background-color');
    $target
      .addClass('spa-x-is-drag')
      .css('background-color','');
  };

  onHeldmoveNav =function ( event ){
    var drag_map = stateMap.drag_map;
    if ( ! drag_map ){ return false; }
    drag_map.top  += event.px_delta_y;
    drag_map.left += event.px_delta_x;
    stateMap.$drag_target.css({
      top  : drag_map.top,
      left : drag_map.left
    });
  };

  onHeldendNav = function ( event ) {
    var css_map, friend_id,
      userID  = configMap.people_model.get_user()._id,
      $drag_target = stateMap.$drag_target;

    if ( ! $drag_target ){ return false; }
    $drag_target
      .removeClass( 'spa-x-is-drag' )
      .css( 'background-color', stateMap.drag_bg_color );

    stateMap.drag_bg_color = undefined;
    stateMap.$drag_target  = null;
    stateMap.drag_map      = null;

    // 
    css_map = {
      top  : parseInt( $drag_target.css( 'top' ), 10 ),
      left : parseInt( $drag_target.css( 'left' ), 10 ),
      'background-color' : $drag_target.css('background-color')
    };

    friend_id = $drag_target.attr( 'data-id' );

    configMap.chat_model.update_avatar({
      relation  : 'friend',
      person_id : userID,
      friend_id : friend_id,
      css_map   : css_map
    });

  };

  onSetchatee = function ( event, arg_map ) {
    var
      $nav       = $(this),
      new_chatee = arg_map.new_chatee,
      old_chatee = arg_map.old_chatee;

    // Use this to highlight avatar of user in nav area
    // See new_chatee.name, old_chatee.name, etc.
    // remove highlight from old_chatee avatar here
    if ( old_chatee ){
      $nav
        .find( '.spa-avtr-box[data-id=' + old_chatee.id + ']' )
        .removeClass( 'spa-x-is-chatee' );
    }

    // add highlight to new_chatee avatar here
    if ( new_chatee ){
      $nav
        .find( '.spa-avtr-box[data-id=' + new_chatee.id + ']' )
        .addClass( 'spa-x-is-chatee' );
    }
  };

  onListchange = function ( event, arg_map ) {
    var
      $nav    = $(this),
      user    = arg_map[0].user,
      friends = arg_map[0].friends,
      pending = arg_map[0].pending,
      invited = arg_map[0].invited,
      status  = arg_map[0].status,
      chatee  = configMap.chat_model.get_chatee() || {},
      friend_id, friend, class_list, avtr_html;
    
    $nav.empty();

    // create avatar box for current user
    avtr_html = String() +
      '<div class="spa-avtr-box spa-x-is-user" data-id="' + String( user._id ) + '" title="' +
        spa.util_b.encodeHtml( user.name ) + '">' +
        '<span class="spa-avtr-box-name"></span>' +
        '<span class="spa-avtr-box-flag"></span>' +
      '</div>';
    
    $(avtr_html).css(user.css_map).appendTo($nav);

    // create avatars box for friends
    for ( friend_id in friends ) {
      if (friends.hasOwnProperty(friend_id)) {
        friend = friends[friend_id];
        class_list = [ 'spa-avtr-box' ];
    
        if ( chatee.id === friend_id ) {
          class_list.push( 'spa-x-is-chatee' );
        }

        avtr_html = String() +
          '<div class="spa-avtr-box" data-id="' + String( friend_id ) + '" title="' +
            spa.util_b.encodeHtml( friend.name ) + '">' +
            '<span class="spa-avtr-box-name">' + spa.util_b.encodeHtml( friend.name ) + '</span>' +
            '<span class="spa-avtr-box-flag"></span>' +
          '</div>';
        
        if (status[friend_id]) {
          $(avtr_html).css(friend.css_map).addClass( 'spa-x-is-online' ).appendTo($nav);
        } else {
          $(avtr_html).css(friend.css_map).appendTo($nav);
        }
      }
    }
  };

  onUserupdate = function ( event, arg_map ) {
    $(this)
      .find( '.spa-avtr-box[data-id=' + arg_map[0]._id + ']' )
      .css( arg_map[0].css_map );
  };

  onStatusupdate = function ( event, arg_map ) {
    var status = arg_map[0].is_online;

    if (status) {
      $(this)
        .find( '.spa-avtr-box[data-id=' + arg_map[0].id + ']' )
        .addClass( 'spa-x-is-online' );
    } else {
      $(this)
        .find( '.spa-avtr-box[data-id=' + arg_map[0].id + ']' )
        .removeClass( 'spa-x-is-online' );
    }
  };

  // response from server to invitee when click on accept button
  // update the friend list by adding the new friend name, and
  // update pending_badge count by decrease 1
  onAcceptinvite = function (event, accept_map) {
    var avtr_html,
      $nav = $(this),
      friend = accept_map[0];

      avtr_html = String() +
        '<div class="spa-avtr-box" data-id="' + String( friend.id ) + '" title="' +
          spa.util_b.encodeHtml( friend.name ) + '">' +
          '<span class="spa-avtr-box-name">' + spa.util_b.encodeHtml( friend.name ) + '</span>' +
          '<span class="spa-avtr-box-flag"></span>' +
        '</div>';

      if (friend.is_online) {
        $(avtr_html).css(friend.css_map).addClass( 'spa-x-is-online' ).appendTo($nav);
      } else {        
        $(avtr_html).css(friend.css_map).appendTo($nav);
      }
  };

  // response from server about the invitee response to the invitation
  // the invitation may be accepted or denied. No matter what is the
  // repsonse, invited_badge count will be updated by decrease 1. If
  // the invitation is accepted, new friend name will be added into
  // the inviter friend list.
  onInviteresponse = function (event, response_map) {
    var avtr_html,
      $nav = $(this),
      friend = response_map[0];

      avtr_html = String() +
        '<div class="spa-avtr-box" data-id="' + String( friend.id ) + '" title="' +
          spa.util_b.encodeHtml( friend.name ) + '">' +
          '<span class="spa-avtr-box-name">' + spa.util_b.encodeHtml( friend.name ) + '</span>' +
          '<span class="spa-avtr-box-flag"></span>' +
        '</div>';

      if (friend.is_online) {
        $(avtr_html).css(friend.css_map).addClass( 'spa-x-is-online' ).appendTo($nav);
      } else {        
        $(avtr_html).css(friend.css_map).appendTo($nav);
      }
  };

  onLogout = function (){
    jqueryMap.$container.empty();
  };
  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Example : spa.avtr.configModule({...});
  // Purpose : Configure the module priorto initialization,
  //   values we do not expect to change during a user session.
  // Action :
  //   The internal configuration data structure (configMap)
  //   is updated with provided arguments. No other actions
  //   are taken.
  // Returns : none
  // Throws  : JavaScript error object and stack trace on
  //   unacceptable or missing arguments
  //
  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });

    return true;
  };
  //End public method /configModule/

  // Begin public method /initModule/
  // Example   : spa.avtr.initModule( $container );
  // Purpose   : Directs the module to begin offering its feature
  // Arguments : $container -container to use
  // Action    : Provides avatar interface for chat users
  // Returns   : none
  // Throws    : none
  //
  initModule = function ( $container ) {
    setJqueryMap($container );
    
    // bind model global events
    $.gevent.subscribe( $container, 'spa-setchatee', onSetchatee );
    $.gevent.subscribe( $container, 'spa-listchange', onListchange);
    $.gevent.subscribe( $container, 'spa-userupdate', onUserupdate);
    $.gevent.subscribe( $container, 'spa-statusupdate', onStatusupdate);
    $.gevent.subscribe( $container, 'spa-acceptinvite', onAcceptinvite );
    $.gevent.subscribe( $container, 'spa-inviteresponse', onInviteresponse );    
    $.gevent.subscribe( $container, 'spa-logout', onLogout );    
    
    // bind actions
    $container
      .bind( 'utap', onTapNav )
      .bind( 'uheldstart', onHeldstartNav )
      .bind( 'uheldmove', onHeldmoveNav )
      .bind( 'uheldend', onHeldendNav );

    return true;
  };
  //End public method /initModule/

  //return public methods
  return {
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());