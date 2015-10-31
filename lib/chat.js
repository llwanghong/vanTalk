/*
 * chat.js - module to providechat messaging
 */

/*jslint  node    : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';

var
  emitUserList, signIn, signOut, chatObj,
  config       = require('./config'),
  socket       = require( 'socket.io' ),
  crud         = require( './crud' ),
  cookieParser = require( 'cookie-parser' ),
  passport     = require( 'passport' ),
  makeMongoId  = MONGOID,
  chatterMap   = {};
// -------------END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN UTILITY METHODS -----------------
// ----------------- END UTILITY METHODS ------------------

// ---------------- BEGIN PUBLIC METHODS ------------------
chatObj = {
  connect : function ( server ) {
    // default is the same option {"pingInterval" : 25000, "pingTimeout" : 60000}
    var io = socket.listen( server, {"pingInterval" : 25000, "pingTimeout" : 60000} );
    
    // authorized the socket connection
    io.use( function ( socket, next ) {
      console.log('socket request (%j)!', socket.id);
      cookieParser(config.sessionSecret)( socket.request, {}, function ( error ) {
        var sessionId = socket.request.signedCookies.vanTalk;
        crud.read(
          "sessions",
          { '_id' : sessionId },
          {},
          function ( error, result_map ) {
            var session = result_map[0];
            if (session) {
              socket.request.session = JSON.parse(session.session);
            } else {
              socket.request.session = {};
            }
            // fill socket.request.user
            passport.initialize()( socket.request, {}, function () {
              passport.session()( socket.request, {}, function () {
                if ( socket.request.user ) {
                  chatterMap[ socket.request.user.name ] = socket;
                  socket.name = socket.request.user.name;
                  next( null, true );
                } else {
                  next( new Error( 'User is not authenticated @ socket.io' ), false );
                }
              });
            });
          }
        );
      });
    });

    // begin io setup socket connection
    io.on( 'connection', function ( socket, next ) {
      console.log('connected socket is %s', socket.id);
      // signin message handler
      // Summary   : Provides sign in capability.
      // Arguments : A single user_map object.
      //   user_map should have the following properties:
      //     name : the name of the user
      //     id   : the server id of the user
      // Action :
      //   If a user with the provided username already registered
      //   then signin with the map and feedback all user's info in
      //   the database, including friends list, messages with each
      //   friend, all invitations sent out, and all pending invitations
      //   from other guys; otherwise, return sigin error info to the
      //   browser client. The hanlder also broadcast user online
      //   status info to all the friends.
      //
      socket.on( 'signin', function ( user_map ) {
        console.log("user_map: %o", user_map);
        crud.update(
          'users',
          { name : user_map.name },
          { $set: {is_online : true} },
          function ( error, result_map ) {
            var friend, friendID,
              friends = {},
              // pending invition from other people
              pending = [],
              // sent invitations
              invited = [],
              // status records all friends' online status
              status = {},
              // uninserted records whether the message_map with the friend
              // has been inserted into messages database
              // initial is false, that is have not been inserted
              uninserted = {},
              user = result_map[0];

            // console.log("user: %o", user);
            if (user) {
              friends = user.friends || {};
              pending = user.pending || [];
              invited = user.invited || [];
              
              // assume message_map for each friend not inserted, record them in uninserted
              for (friendID in friends) {
                if (friends.hasOwnProperty(friendID)) {
                  uninserted[friendID] = false;
                  friends[friendID].messages = [];
                }
              }

              // send client its updated info on server
              socket.emit( 'signin', user );
              
              // info all online friends the user is online
              for (friendID in friends) {
                if (friends.hasOwnProperty(friendID)) {
                  friend = friends[friendID];

                  crud.read(
                    'users',
                    { 'name' : friend.name },
                    {},
                    function ( error, friend_map ) {
                      var friends, friend;
                      
                      friend = friend_map[0];
                      if (friend) {
                        friends = friend.friends;
                        // if the friend has friends
                        if (friends) {
                          // if they are still friend
                          if (friends[user._id]) {        
                            if (friend.is_online) {
                              status[friend._id] = true;
                            } else {
                              status[friend._id] = false;                          
                            }          
                            if (chatterMap[friend.name]) {
                              console.log('Socket info friend: %s online info', friend.name);
                              chatterMap[friend.name].emit(
                                'statusupdate',
                                {
                                  'name' : user.name,
                                  'id'   : user._id,
                                  'is_online' : true
                                }
                              );
                            }                  
                          } else {
                            // if they are not friend, always show grey offline status
                            status[friend._id] = false;                          
                          }
                        } // end of if (friends)
                      } // end of if (friend)
                    } // end of read callback
                  ); // end of read
                } // end of if (friends.hasOwnProperty(friendID))
              } // end of for (friendID in friends)

              /* message_map form
               * {
               *   name: user._id + '_' + friend.id,
               *   messages: [
               *     {
               *       date: month + day + month,
               *       time: 1445001857794, can be converted to UTC time by new Date(date)
               *       sender_id: "561a1b90cc3be3cc2f96a59e",
               *       sender_name: "Hong",
               *       receiver_id: "5619f775204cf9fd598d2ddd",
               *       receiver_name: "Betty",
               *       message_text: "How are you?"
               *     }
               *   ]
               * }
               */
              crud.read(
                'messages',
                { 'name' : { $regex: user._id + '_' } },
                {},
                function ( error, messages_map ) {                 
                  var idx, len, message, friend_id;
                  if (messages_map.length > 0) { // 
                    for (idx = 0, len = messages_map.length; idx < len; idx++) {
                      message = messages_map[idx];
                      if (message) {
                        friend_id = message.name.split('_')[1];
                        // find the friend info
                        if (friends[friend_id]) {
                          // fetch the near 50 messages
                          friends[friend_id].messages = message.messages.slice(-50); 
                        }
                        uninserted[friend_id] = true;
                      }
                    }
                  }
                 
                  socket.emit( 'listchange', {
                    'user'    : user,
                    'friends' : friends,
                    'pending' : pending,
                    'invited' : invited,
                    'status'  : status
                  });

                  // insert message_map for friend recorded in uninserted into messages collection
                  for (friend_id in uninserted) {
                    if (uninserted.hasOwnProperty(friend_id)) {
                      if ( !uninserted[friend_id] ) {
                        crud.construct(
                          'messages',
                          { 
                            name: user._id + '_' + friend_id,
                            messages: []
                          },
                          function ( error, message ) {
                            if (error) {
                              return next( error );
                            }
                          } // end of callback
                        ); // end of construct
                      }
                    }
                  }                  
                }
              );

              // log connected socket info into online buffer of server
              // online buffer contains all connected sockets
              chatterMap[ user.name ] = socket;
              socket.name = user.name;

            } // end of if (user)
          } // end of update callback
        ); // end of update
      }); // end of signin callback
      // End /adduser/ message handler
      
      // Begin /updatechat/ message handler
      // Summary   : Handles messages for chat.
      // Arguments : A single chat_map object.
      //   chat_map should have the following properties:
      //     date          : date with the form 'Mon_Day_Year'
      //     time          : milliseconds since 1970
      //     receiver_id   : id of recipient
      //     receiver_name : name of recipient
      //     sender_id     : id of sender
      //     sender_name   : id of sender
      //     message_text  : message text
      // Action :
      //   If the recipient is online, the chat_map is sent to her.
      //   If not, a 'user has gone offline' message is
      //     sent to the sender.
      //
      socket.on( 'updatechat', function ( chat_map ) {
        var
          date          = chat_map.date,
          time          = chat_map.time,
          sender_id     = chat_map.sender_id,
          sender_name   = chat_map.sender_name,
          receiver_id   = chat_map.receiver_id,
          receiver_name = chat_map.receiver_name,
          message_text  = chat_map.message_text;

        // add to sender messages
        crud.update(
          'messages',
          { name: sender_id + '_' + receiver_id},
          { $push: { messages : chat_map }},
          function ( error, message ) {
            if (error) {
              console.log('Fail to insert message for sender due to %j', error);
              return next( error );
            }
          } // end of callback
        ); // end of update

        // add to receiver messages
        crud.update(
          'messages',
          { name: receiver_id + '_' + sender_id},
          { $push: { messages : chat_map }},
          function ( error, message ) {
            if (error) {
              return next( error );
            }
          } // end of callback
        ); // end of update

        if ( chatterMap.hasOwnProperty( chat_map.receiver_name ) ) {
          // if the receiver is online, send the message to him
          chatterMap[ chat_map.receiver_name ]
            .emit( 'updatechat', chat_map );
        }
        else {
          // otherwise feedback the sender with receiver offline info
          socket.emit( 'updatechat', {
            date : chat_map.date,
            time : chat_map.time,
            sender_id : chat_map.sender_id,
            sender_name : chat_map.sender_name,
            receiver_id : chat_map.receiver_id,
            receiver_name : chat_map.receiver_name,
            message_text : chat_map.receiver_name + ' has gone offline.'
          });
        }
      });
      // End /updatechat/ message handler

      // Begin disconnect methods 
      socket.on( 'disconnect', function ( reason ) { 
        console.log( '** socket (%s) closed for user (%s) due to %s **', socket.id, socket.name, reason );
        
        crud.update(
          'users',
          { 'name' : socket.name },
          { $set: { is_online : false } },
          function ( error, result_map ) {
            var friend, friendID,
              user = result_map[0],
              friends = user.friends;

            // info all online friends the user is offline
            for (friendID in friends) {
              if (friends.hasOwnProperty(friendID)) {
                friend = friends[friendID];
                crud.read(
                  'users',
                  { 'name' : friend.name },
                  {},
                  function ( error, friend_map ) {
                    var friend, friends;
                    
                    friend = friend_map[0];
                    if (friend) {
                      friends = friend.friends;
                      // if the friend has friends
                      if (friends) {
                        if (friends[user._id]) {                  
                          if (chatterMap[friend.name]) {
                            console.log('Socket info friend: %s offline info', friend.name);
                            chatterMap[friend.name].emit(
                              'statusupdate',
                              {
                                'name' : user.name,
                                'id'   : user._id,
                                'is_online' : false
                              }
                            );
                          } // end of if (friends[user._id])                
                        } // end of if (friends[user._id])
                      } // end of if (friends)
                    } // end of if (friend)
                  } // end of read callback
                ); // end of read
              } // end of if (friends.hasOwnProperty(friendID))
            } // end of for

            delete chatterMap[ socket.name ];
          }
        );
      }); 
      // End disconnect methods

      // userupdate message handler 
      // Summary : currently only handles client updates of avatars 
      // Arguments : A single avtr_map object, avtr_map may have the
      //   following properties: 
      //   person_id : the id of the person, whose avatar will be update  
      //   friend_id : the id of the person's friend, whose position
      //               will be update
      //   css_map   : the css map for the update request, if the request
      //               is sent by the person, css map will only include
      //               background-color; otherwise, if it was sent by
      //               person's friend, css map will include top, left
      //               properties 
      // Action : 
      //   This handler updates the requester in database, if person's
      //   avatar is updated, then broadcasts the revised info to all
      //   friends. 
      // 
      socket.on( 'userupdate', function ( avtr_map ) { 
        var
          personID = avtr_map.person_id,
          friendID = avtr_map.friend_id,
          css_map  = avtr_map.css_map,
          relation = avtr_map.relation;

        if ( relation === "own" ) {
          crud.update(
            'users',
            { '_id' : makeMongoId( personID ) }, 
            { $set: {'css_map' : css_map} }, 
            function ( error, update_map ) {
              var friend, friendID,
                friends = update_map[0].friends;
              
              // if the user has friends
              if (friends) {
                // check whether the user is still friend of each friend
                for (friendID in friends) {
                  if (friends.hasOwnProperty(friendID)) {
                    friend = friends[friendID];
                    crud.read(
                      'users',
                      { 'name' : friend.name },
                      {},
                      function ( error, friend_map ) {
                        var friend, friends;
                        
                        friend = friend_map[0];
                        if (friend) {
                          friends = friend.friends;
                          // if the friend has friends
                          if (friends) {
                            if (friends[personID]) {
                              friends[personID].css_map['background-color'] = css_map['background-color'];
                              // if they are still friends, info them
                              crud.update(
                                'users',
                                { 'name' : friend.name }, 
                                { $set: {'friends' : friends} },
                                function ( error, info_map ) {
                                  console.log('Info friend: %s for avatar update', friend.name);
                                }
                              );
      
                              if (chatterMap[friend.name]) {
                                console.log('Socket info friend: %s for avatar update', friend.name);
                                chatterMap[friend.name].emit( 'userupdate', update_map[0] );
                              }      
                            } // end of if (friends[personID])
                          } // if (friends)
                        } // if (friend)
                      } // end of read callback
                    ); // end of read
                  } // end of if (friends.hasOwnProperty(friendID))
                } // end of for (friendID in friends)
              } // end of if (friends)
            } // end of update callback
          ); // end of update 
        } else {
          // relation is friend, only update friend's position in the friends css_map
          // only affect friend's show in his own view
          crud.read(
            'users',
            { '_id' : makeMongoId( personID ) },
            {},
            function ( error, result_map ) {
              var friends = result_map[0].friends;
              if (friends[friendID]) {
                friends[friendID].css_map = css_map;
                // update friend position info
                crud.update(
                  'users',
                  { '_id' : makeMongoId( personID ) }, 
                  { $set: {'friends' : friends} },
                  function ( error, update_map ) {
                    console.log('Update friend: %s in chat view', friends[friendID].name);
                  }
                ); // end of update
              } // end of if (friends[friendID])
            } // end of read callback
          ); // end of read
        } // end of else

      });
      // End /userupdate/ message handler

      // handle invitation to friends
      // form of invite_map is as following
      // {
      //   'inviter' : {
      //     'name'    : inviter_name,
      //     'id'      : inviter_id,
      //     'css_map' : inviter_css_map
      //   },
      //   'invited' : {
      //     'invitee' : {
      //       'name'    : invitee_name,
      //       'id'      : invitee_id,
      //       'css_map' : invitee_css_map
      //     },
      //     ... ...
      //   }
      // }
      // need do following updates
      //   inviter's invited array in DB
      //   each invitee's pending array in DB
      //
      socket.on( 'invitefriend', function ( invite_map ) {
        var inviter = invite_map.inviter,
            invited = invite_map.invited,
            i, len, friend;

        for (i = 0, len = invited.length; i < len; i++) {
          friend = invited[i];
          crud.update( 
            'users',
            { 'name' : inviter.name }, 
            { '$push' : {'invited' : friend} }, 
            function ( error, result_map ) {
              if (error) {
                console.log('Error happend when update invited of %s', inviter.name);
              }
              crud.update(
                'users',
                { 'name'  : friend.name },
                { '$push' : {'pending' : inviter}},
                function (error, pending_map) {
                  if (error) {
                    console.log('Error happend when update pending of %s', inviter.name);
                  }
                  console.log('%s successfully inviting %s', inviter.name, friend.name);
                }
              );

              socket.emit( 'invitefriend', friend );
  
              if (chatterMap[friend.name]) {
                chatterMap[friend.name].emit( 'inviterequest', inviter );
              }
            } 
          );
        }
      });

      // handler of acceptance of inviter
      // accept_map has the following form
      // {
      //   'invitee' : {
      //     'id'      : invitee_id,
      //     'name'    : invitee_name,
      //     'css_map' : invitee_css_map
      //   },
      //   'inviter' : {
      //     'id'      : inviter_id,
      //     'name'    : inviter_name,
      //     'css_map' : inviter_css_map
      //   }
      // }
      //
      // all above css_map are as following
      // for inviter, top and left are generated randomly
      // {
      //   'top'  : ...,
      //   'left' : ...,
      //    'background-color' : ... 
      // }
      //
      socket.on( 'acceptinvite', function ( accept_map ) {
        var invitee = accept_map.invitee,
            inviter = accept_map.inviter;

        console.log('%s accept invitation from %s', invitee.name, inviter.name);

        // process pending and friends of invitee
        crud.read(
          'users',
          { 'name' : invitee.name },
          {},
          function ( error, result_map ) {
            var pending, friends, i, len, e;

            pending = result_map[0].pending;
            friends = result_map[0].friends || {};
            len = pending.length;

            for (i = 0; i < len; i++) {
              e = pending[i];
              if (e.name === inviter.name) {
                pending.splice(i, 1);
                break;
              }
            }

            friends[inviter.id] = inviter;
            crud.update(
              'users',
              { 'name' : invitee.name },
              { '$set' : {
                'pending' : pending,
                'friends' : friends
              }},
              function (error, update_map) {
                var invitee;
                if (error) {
                  console.log('Error happend when update pending %j of %s', pending, invitee.name);
                }
                invitee = update_map[0];
                // comment this emit, and emit after knowing the online status of inviter
                // socket.emit( 'acceptinvite', inviter );
                console.log('successfully update pending %j of %s', pending, invitee.name);
              }
            );
          }
        );

        // process invited and friends of inviter
        crud.read( 
          'users',
          { 'name' : inviter.name }, 
          {},
          function ( error, result_map ) {
            var invited, friends, i, len, e;
            invited = result_map[0].invited;
            friends = result_map[0].friends || {};
            len = invited.length;

            for (i = 0; i < len; i++) {
              e = invited[i];
              if (e.name === invitee.name) {
                invited.splice(i, 1);
                break;
              }
            }

            friends[invitee.id] = invitee;
            crud.update(
              'users',
              { 'name' : inviter.name },
              { '$set' : {
                'invited' : invited,
                'friends' : friends
              }},
              function (error, update_map) {
                var inviter;
                if (error) {
                  console.log('Error happend when update invited %j of %s', invited, inviter.name);
                }
                
                inviter = update_map[0];


                if (chatterMap[inviter.name]) {
                  // if inviter is online, info inviter about the invite response
                  invitee.is_online = true;
                  chatterMap[inviter.name].emit( 'inviteresponse', invitee );
                  // info invitee about the server response to invitation accept                  
                  socket.emit(
                    'acceptinvite',
                    {
                      'id'        : inviter._id,
                      'name'      : inviter.name,
                      'css_map'   : accept_map.inviter.css_map, // css_map should be in accept.inviter
                      'is_online' : true
                    }
                  );
                } else {
                  // info invitee about the server response to invitation accept                  
                  socket.emit(
                    'acceptinvite',
                    {
                      'id'        : inviter._id,
                      'name'      : inviter.name,
                      'css_map'   : accept_map.inviter.css_map, // css_map should be in accept.inviter
                      'is_online' : false
                    }
                  );
                }

                console.log('successfully update invited %j of %s', invited, inviter.name);
              }
            );
          }
        );

      });


    });
    // End io setup
  }
};

module.exports = chatObj;
// ----------------- END PUBLIC METHODS -------------------