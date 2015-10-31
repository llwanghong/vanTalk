/*
 * spa.model.js
 * Model module
 */

/*jslint  browser : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global TAFFY, $, spa */
spa.model = (function () {
  'use strict';
  var
    stateMap = {
      user : null
    },

    people, chat, initModule;

  // The people object API
  // ---------------------
  // The people object is available at spa.model.people, which provides
  // methods and events to manage a collection of person objects.
  // Its public methods include:
  //   * get_user()
  //       return the current user. If the current user is not
  //       signed-in, returns null.
  //   * login( <user_map> )
  //       login with the provided user_map. The user_map should include
  //       the name/id/email of the user. It will publish a series of
  //       global custom events, including 'spa-login', 'spa-logout',
  //       'spa-statusupdate', 'spa-listchange', 'spa-userupdate',
  //       'spa-invitefriend', 'spa-acceptinvite' and 'spa-inviteresponse' etc.
  //       It will send the signin request by emitting 'signin' event
  //       to the server.
  //   * logout()
  //       logout the current user. It publishes a 'spa-logout' global
  //       custom event.
  //
  // jQuery global custom events published by the object include:
  //   * spa-login - This is published when a user login process
  //     completes. The updated user object is provided as data.
  //   * spa-logout - This is published when a logout completes.
  //     The former user object is provided as data.
  //   
  // jQuery global custom events published by the object include:
  //   * spa-login - This is published when a user login process
  //     completes. The signined user object is provided as data.
  //
  //   * spa-logout - This is published when a logout completes.
  //     The former user object is provided as data.
  //
  //   * spa-statusupdate - This is published when a user login
  //     process completes. A map of the form:
  //     {
  //       'name'      : user_name,
  //       'id'        : user_id,
  //       'is_online' : true
  //     }
  //     is provided as data.
  //
  //   * spa-listchange - This is published when a user login
  //     process completes. A map of the form:
  //     {
  //       'user'    : user,    // user info
  //       'friends' : friends, // all friends' info
  //       'pending' : pending, // all pending invitaions
  //       'invited' : invited, // all sent invitations
  //       'status'  : status   // all friends' online status info
  //     }
  //     is provided as data.
  //
  //   * spa-userupdate - This is published when a user click
  //     on the avatars in the view. A map of the form:
  //     {
  //       person_id : the id of the person, whose avatar will be update  
  //       friend_id : the id of the person's friend, whose position
  //                   will be update
  //       css_map   : the css map for the update request, if the request
  //                   is sent by the person, css map will only include
  //                   background-color; otherwise, if it was sent by
  //                   person's friend, css map will include top, left
  //                   properties
  //     }
  //     is provided as data.
  //
  //   * spa-invitefriend - This is published when user get the sent
  //     invitation response from the server. A map of the form:
  //     {
  //       'name'    : invitee_name,
  //       'id'      : invitee_id,
  //       'css_map' : invitee_css_map
  //     }
  //     is provided as data.
  //
  //   * spa-acceptinvite - This is published when user get the acceptance of
  //     invitation response from the server. A map of the form:
  //     {
  //       'id'        : inviter_id,
  //       'name'      : inviter_name,
  //       'css_map'   : inviter_css_map,
  //       'is_online' : inviter_online_status
  //     }
  //     is provided as data.
  //
  //   * spa-inviteresponse - This is published when user get sent invitation
  //     response from the server. A map of the form:
  //     {
  //       'id'        : invitee_id,
  //       'name'      : invitee_name,
  //       'css_map'   : invitee_css_map,
  //       'is_online' : invitee_online_status
  //     }
  //     is provided as data.
  //

  people = (function () {
    var get_user, login, logout;

    get_user = function () { return stateMap.user; };

    login = function ( user_map ) {
      var sio = spa.data.getSio();
      
      sio.on( 'signin', function ( result_map ) {
        stateMap.user = result_map[ 0 ];
        $.gevent.publish( 'spa-login', stateMap.user );
      });

      sio.on( 'statusupdate', function ( status_map ) {
        $.gevent.publish( 'spa-statusupdate', status_map );
      });

      sio.on( 'listchange', function ( result_map ) {
        $.gevent.publish( 'spa-listchange', result_map );
      });

      sio.on( 'userupdate', function ( result_map ) {
        $.gevent.publish( 'spa-userupdate', result_map );
      });

      // chatting message update handler for server response
      sio.on( 'updatechat', function ( arg_list ) {
        chat.update_chat(arg_list);
      });

      // response from server to inviter about whether his
      // invitation has been sent
      sio.on( 'invitefriend', function ( arg_list ) {
        $.gevent.publish( 'spa-invitefriend', arg_list );
      });

      // friend invitation of other guys from server to me
      sio.on( 'inviterequest', function ( arg_list ) {
        chat.invite_request(arg_list);
      });

      // response from server about invitee's acceptance
      // to the invitaion, acceptance has been sent
      sio.on( 'acceptinvite', function ( arg_list ) {
        var friend = arg_list[0];
        stateMap.user.friends[friend.id] = friend;
        $.gevent.publish( 'spa-acceptinvite', arg_list );
      });

      // invitation response of other guys from server
      // can be accept or deny
      sio.on( 'inviteresponse', function ( arg_list ) {
        var friend = arg_list[0];
        stateMap.user.friends[friend.id] = friend;
        $.gevent.publish( 'spa-inviteresponse', arg_list );
      });     

      sio.emit( 'signin', user_map );
    };

    logout = function () {
      var user = stateMap.user;
  
      stateMap.user = null;
      $.gevent.publish( 'spa-logout', [ user ] );
    };

    return {
      get_user   : get_user,
      login      : login,
      logout     : logout
    };
  }());

  // The chat object API
  // -------------------
  // The chat object is available at spa.model.chat, which
  // provides methods and events to manage chat messaging.
  // Its public methods include:
  //   * get_chatee()
  //       return the chatee with whom the user is chatting.
  //   * set_chatee( <person_id> )
  //       set the chatee to the person identified by person_id.
  //       It publishes a 'spa-setchatee' global custom event.
  //   * send_msg( <msg_text> )
  //       send a message to the chatee. It publishes a
  //       'spa-updatechat' global custom event by calling
  //       'update_chat' method, and emits 'updatechat' event
  //       to the server.
  //   * update_avatar( <update_avtr_map> )
  //       send the update_avtr_map to the server by emitting an
  //       'userupdate'.
  //   * update_chat( arg_list )
  //       handler for server response to 'send_msg' method.
  //       It publishes a 'spa-updatechat' global custom event.
  //   * invite_friend ( invite_map )
  //       send the invite_map to the server to invite one friend
  //       by emitting 'invitefriend' event.
  //   * invite_request ( request_map )
  //       handler for invitation from other guy in the server
  //       It publishes 'spa-inviterequest' global custom event
  //       with 'invite_map' to the user.
  //   * accept_invite ( accept_map )
  //       send the accept_map to the server to accept the invitation
  //       from other guy by emitting 'acceptinvite' event.
  //
  // jQuery global custom events published by the object include:
  //   * spa-setchatee - This is published when a new chatee is
  //     set. A map of the form:
  //     { old_chatee : <old_chatee_object>,
  //       new_chatee : <new_chatee_object>
  //     }
  //     is provided as data.

  //   * spa-updatechat - This is published when a new message
  //     is received or sent. A map of the form:
  //     {
  //       date          : date with the form 'Mon_Day_Year'
  //       time          : milliseconds since 1970
  //       receiver_id   : id of recipient
  //       receiver_name : name of recipient
  //       sender_id     : id of sender
  //       sender_name   : id of sender
  //       message_text  : message text
  //     }
  //     is provided as data.
  //
  //   * spa-inviterequest - This is published when a new invitation
  //     is received from server. A map of the form:
  //     {
  //       'name'    : inviter_name,
  //       'id'      : inviter_id,
  //       'css_map' : inviter_css_map
  //     }
  //     is provided as data.
  //
  chat = (function () {
    var
      update_chat,
      get_chatee, send_msg,
      set_chatee, update_avatar,
      invite_friend, invite_request,
      accept_invite,

      chatee = null;
   
    // handler for server response to chatting message
    update_chat = function ( arg_list ) {
      var msg_map = arg_list[ 0 ]; 
  
      // if chatee has not been setted up yet, or if the sender is
      // either the current user or the current chatee, switch
      // chatee to sender
      if ( !chatee ) {
        set_chatee( msg_map.sender_id );
      }
      else if ( msg_map.sender_id !== stateMap.user._id 
        && msg_map.sender_id !== chatee.id 
      ) {
        set_chatee( msg_map.sender_id );
      }

      $.gevent.publish( 'spa-updatechat', [ msg_map ] ); 
    };

    // get the current chatee
    get_chatee = function () { return chatee; };

    // handler for chatting message send and feedback
    // to the user (sender) about the sending
    send_msg = function ( message_text ) {
      var msg_map, date, time,
        sio = spa.data.getSio();

      time = new Date();
      date = (time.getMonth() + 1) + '_' + time.getDate() + '_' + time.getFullYear();
      time = time.getTime();

      if ( !sio ) { return false; }
      if ( ! (stateMap.user && chatee) ) { return false; }

      msg_map = {
        date          : date,
        time          : time,
        receiver_id   : chatee.id, 
        receiver_name : chatee.name, 
        sender_id     : stateMap.user._id, 
        sender_name   : stateMap.user.name, 
        message_text  : message_text 
      };

      // published updatechat so to show the outgoing messages
      update_chat( [ msg_map ] ); 
      sio.emit( 'updatechat', msg_map );

      return true; 
    };  

    // handler for updating chatee
    set_chatee = function ( person_id ) {
      var new_chatee; 
      new_chatee = stateMap.user.friends[ person_id ]; 
      if ( new_chatee ) { 
        // if the provided chatee is the same as the current one, the code
        // does nothing and return false
        if ( chatee && chatee.id === new_chatee.id ) { 
          return false; 
        } 
      } 
      else { 
        new_chatee = null; 
      } 

      $.gevent.publish( 'spa-setchatee',
        { old_chatee : chatee, new_chatee : new_chatee }
      );

      chatee = new_chatee;
      
      return true;
    };

    // updated avatar_map should have the form:
    // { person_id : <string>,
    //   css_map : { 
    //     top  : <int>,
    //     left : <int>, 
    //     'background-color' : <string> 
    //   }
    // }; 
    // 
    update_avatar = function ( avatar_map ) { 
      var sio = spa.data.getSio(); 
      if ( sio ) { 
        sio.emit( 'userupdate', avatar_map ); 
      } 
    };

    // handler for inviting friend when user confirm
    // to send invitation to a friend
    // will emit 'invitefriend' event to server
    invite_friend = function ( invite_map ) {
      var sio         = spa.data.getSio(),
          friend      = "",
          friends_arr = [],
          inviter     = invite_map.inviter,
          friends_map = invite_map.invited;

      for (friend in friends_map) {
        if (friends_map.hasOwnProperty(friend)) {
          if (friends_map[friend] !== '') {
            friends_arr.push({
              'name'    : friend,
              'id'      : friends_map[friend].id,
              'css_map' : friends_map[friend].css_map
            });
          }
        }
      }

      if (friends_arr.length === 0) { return false; }

      sio.emit( 'invitefriend', {'inviter' : inviter, 'invited' : friends_arr} ); 
    };

    // handler for invitation from other guy in the server
    // will publish 'spa-inviterequest' event to the user
    invite_request = function ( request_map ) {
      $.gevent.publish( 'spa-inviterequest', request_map );
    };

    // handler for acceptance of invitation when user click
    // accept in the pending list
    // will emit 'acceptinvite' event to the server
    accept_invite = function ( accept_map ) {
      var sio  = spa.data.getSio();
      sio.emit( 'acceptinvite', accept_map ); 
    };

    return {
      get_chatee     : get_chatee,
      send_msg       : send_msg, 
      set_chatee     : set_chatee,
      update_avatar  : update_avatar,
      update_chat    : update_chat,
      invite_friend  : invite_friend,
      accept_invite  : accept_invite,
      invite_request : invite_request
    };

  }());

  initModule = function () {};

  return {
    initModule : initModule,
    people     : people,
    chat       : chat
  };
}());