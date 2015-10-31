/*
 * spa.chat.js
 * Chat feature module for SPA
 */

/*jslint  browser : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global $, spa */

/* main_html processing: ^(\s*)(<.*) -> $1+ '$2' */

spa.chat = (function () {
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : String()
        + '<div class="spa-chat">'
          + '<div class="spa-chat-head">'
            + '<div class="spa-chat-head-toggle">+</div>'
            + '<div class="spa-chat-head-title">Chat</div>'
          + '</div>'
          + '<div class="spa-chat-closer">x</div>'
          + '<div class="spa-chat-sizer">'
            + '<div class="spa-chat-list">'
              + '<div class="spa-chat-list-box"></div>'
              + '<div class="spa-chat-pending-box">'
                + 'Pending<span class="badge">0</span>'
              + '</div>'
              + '<div class="spa-chat-invited-box">'
                + 'Invited<span class="badge">0</span>'
              + '</div>'
            + '</div>'
            + '<div class="spa-chat-serve">'
              + '<div class="spa-chat-serve-video"></div>'
              + '<div class="spa-chat-serve-search"></div>'
              + '<div class="spa-chat-serve-setting"></div>'
            + '</div>'
            + '<div class="spa-chat-msg">'
              + '<div class="spa-chat-msg-log">'
                + '<div class="spa-chat-greeting-message">vanTalk</div>'
              + '</div>'
              + '<div class="spa-chat-msg-in">'
                + '<form class="spa-chat-msg-form">'
                  + '<div class="spa-chat-msg-input-wrapper">'
                    + '<input type="text"/>'
                  + '</div>'
                  + '<input type="submit" style="display:none"/>'
                  + '<div class="spa-chat-msg-send">'
                    + 'send'
                  + '</div>'
                + '</form>'
              + '</div>'
            + '</div>'
          + '</div>'
          + '<div id="spa-chat-up" class="spa-chat-resizable"></div>'
          + '<div id="spa-chat-rightup" class="spa-chat-resizable"></div>'
          + '<div id="spa-chat-right" class="spa-chat-resizable"></div>'
          + '<div id="spa-chat-rightdown" class="spa-chat-resizable"></div>'
          + '<div id="spa-chat-down" class="spa-chat-resizable"></div>'
          + '<div id="spa-chat-leftdown" class="spa-chat-resizable"></div>'
          + '<div id="spa-chat-left" class="spa-chat-resizable"></div>'
          + '<div id="spa-chat-leftup" class="spa-chat-resizable"></div>'
        + '</div>',

      settable_map : {
        slider_open_time    : true,
        slider_close_time   : true,
        slider_opened_height_em : true,
        slider_opened_width_em  : true,
        slider_closed_height_em : true,
        slider_closed_width_em  : true,
        slider_opened_title : true,
        slider_closed_title : true,
        chat_model      : true,
        people_model    : true,
        set_chat_anchor : true,
        modal_overlay   : true
      },

      slider_open_time    : 200,
      slider_close_time   : 200,
      slider_opened_height_em : 28,
      slider_opened_width_em  : 42.5,
      slider_closed_height_em : 2,
      slider_closed_width_em  : 32,
      slider_opened_title : 'Tap to close',
      slider_closed_title : 'Tap to open',
      slider_opened_min_em : 12,

      chat_model      : null,
      people_model    : null,
      set_chat_anchor : null,
      modal_overlay   : null
    },

    stateMap = {
      $append_target   : null,
      position_type    : 'closed',
      px_per_em        : 0,
      slider_hidden_px : 0,
      slider_closed_height_px : 0,
      slider_closed_width_px  : 0,
      slider_opened_height_px : 0,
      slider_opened_width_px  : 0,
      status : 'closed',
      messages : {},
      last_message : {},
      pending_exist : false,
      pending_messages : "",
      pending_selected : false,
      invited_exist : false,
      invited_messages : "",
      invited_selected : false,
      user    : null,
      friends : {},
      pending : [],
      invited : []
    },

    jqueryMap = {},
    getRandRgb, getRandPosition,
    saveChatDimension, restoreChatDimension,
    setJqueryMap, setPxSizes, setModalOverlay,
    scrollChat, writeAlert, clearChat,
    setSliderPosition,
    onTapToggle, onSubmitMsg, onTapList, 
    onSetchatee, onUpdatechat, onListchange,
    onInvitefriend, onInviteresponse,
    onAcceptinvite, onInviterequest,
    onLogin, onLogout,
    configModule, initModule,
    removeSlider, handleResize,
    handleDragResize;
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

  saveChatDimension = function () {
    window.name = JSON.stringify({
      'width'  : stateMap.slider_opened_width_px,
      'height' : stateMap.slider_opened_height_px,
      'status' : stateMap.position_type
    });
  };

  restoreChatDimension = function () {
    var dimension;
    if (window.name === "") {
      return false;
    } else {
      dimension = JSON.parse(window.name);

      stateMap.slider_opened_width_px  = dimension.width;
      stateMap.slider_opened_height_px = dimension.height;
      stateMap.position_type = dimension.status;

      return true;
    }
  };
  //-------------------- END UTILITY METHODS -------------------

  //------------------- BEGIN UTILITY METHODS ------------------
  // getEmSize = function ( elem ) {
  //   return Number(
  //     getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d)[0]
  //   );
  // };*/
  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var
      $append_target = stateMap.$append_target,
      $slider = $append_target.find( '.spa-chat' );

    jqueryMap = {
      $slider        : $slider,
      $head          : $slider.find( '.spa-chat-head' ),
      $toggle        : $slider.find( '.spa-chat-head-toggle' ),
      $title         : $slider.find( '.spa-chat-head-title' ),
      $sizer         : $slider.find( '.spa-chat-sizer' ),
      $list_box      : $slider.find( '.spa-chat-list-box' ),
      $pending_box   : $slider.find( '.spa-chat-pending-box' ),
      $pending_badge : $slider.find( '.spa-chat-pending-box .badge' ),
      $invited_box   : $slider.find( '.spa-chat-invited-box' ),
      $invited_badge : $slider.find( '.spa-chat-invited-box .badge' ),
      $serve_video   : $slider.find( '.spa-chat-serve-video' ),
      $serve_search  : $slider.find( '.spa-chat-serve-search' ),
      $serve_setting : $slider.find( '.spa-chat-serve-setting' ),
      $msg_log       : $slider.find( '.spa-chat-msg-log' ), 
      $msg_in        : $slider.find( '.spa-chat-msg-in' ), 
      $input         : $slider.find( '.spa-chat-msg-in input[type=text]' ),
      $send          : $slider.find( '.spa-chat-msg-send' ), 
      $form          : $slider.find( '.spa-chat-msg-form' ),
      $up            : $slider.find( '#spa-chat-up' ),
      $rightup       : $slider.find( '#spa-chat-rightup' ),
      $right         : $slider.find( '#spa-chat-right' ),
      $rightdown     : $slider.find( '#spa-chat-rightdown' ),
      $down          : $slider.find( '#spa-chat-down' ),
      $leftdown      : $slider.find( '#spa-chat-leftdown' ),
      $left          : $slider.find( '#spa-chat-left' ),
      $leftup        : $slider.find( '#spa-chat-leftup' ),
      $window        : $(window)
    };
  };
  // End DOM method /setJqueryMap/

  // Begin DOM method /setPxSizes/
  // Purpose : Calculate the pixel sizes for elements managed by this
  //           module.
  setPxSizes = function () {
    var px_per_em,
        window_height_em, window_width_em,
        opened_height_em, opened_width_em;

    px_per_em = spa.util_b.getCurrentStyle( jqueryMap.$slider.get(0), "fontSize" );
    window_height_em = Math.floor( ( jqueryMap.$window.height() / px_per_em ) + 0.5 );
    window_width_em  = Math.floor( ( jqueryMap.$window.width()  / px_per_em ) + 0.5 );
    opened_height_em = Math.floor( ( stateMap.slider_opened_height_px / px_per_em ) + 0.5 );
    opened_width_em  = Math.floor( ( stateMap.slider_opened_width_px  / px_per_em ) + 0.5 );

    // temporarily enhanced version
    opened_height_em = opened_height_em || configMap.slider_opened_height_em;
    opened_width_em  = opened_width_em  || configMap.slider_opened_width_em;
    opened_height_em = window_height_em - opened_height_em <= 6 ?
        window_height_em - 4.5 > configMap.slider_opened_height_em ?
        window_height_em - 4.5
      : configMap.slider_opened_height_em
      : opened_height_em;
    opened_width_em  = window_width_em  - opened_width_em  <= 6 ?
        window_width_em  - 4.5 > configMap.slider_opened_width_em ?
        window_width_em  - 4.5
      : configMap.slider_opened_width_em
      : opened_width_em;

    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_height_px = configMap.slider_closed_height_em * px_per_em;
    stateMap.slider_closed_width_px  = configMap.slider_closed_width_em  * px_per_em;

    stateMap.slider_opened_height_px = opened_height_em * px_per_em;
    stateMap.slider_opened_width_px  = opened_width_em  * px_per_em;

  };
  // End DOM method /setPxSizes/

  // Begin public method /setSliderPosition/
  // Example : spa.chat.setSliderPosition( 'closed' );
  // Purpose : Move the chat slider to the requested position
  // Arguments :
  //   * position_type - enum('closed', 'opened', or 'hidden')
  //   * callback      - optional callback to be run at the end of
  //                     slider animation. The callback receives a
  //                     jQuery collection representing the slider
  //                     div as its single argument
  // Action :
  //   This method moves the slider into the requested position. If
  //   the requested position is the current position, it returns
  //   true without taking further action
  // Returns :
  //   * true  - The requested position was achieved
  //   * false - The requested position was not achieved
  // Throws : none
  //
  setSliderPosition = function ( position_type, callback ) {
    var
      height_px, width_px,
      animate_time, slider_title, toggle_text;

    // slider position operation is not allowed for anon user;
    // therefore we simply return false; the shell will fix the 
    // uri and try again. 
    if ( !configMap.people_model.get_user() ) {
      return false;
    }

    // prepare animate parameters
    switch ( position_type ){
      case 'opened' :
        height_px    = stateMap.slider_opened_height_px;
        width_px     = stateMap.slider_opened_width_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text  = '-';
        jqueryMap.$input.focus();
        jqueryMap.$up.css({ display: "block" });
        // jqueryMap.$rightup.css({ display: "block" });
        // jqueryMap.$right.css({ display: "block" });
        // jqueryMap.$rightdown.css({ display: "block" });
        // jqueryMap.$down.css({ display: "block" });
        // jqueryMap.$leftdown.css({ display: "block" });
        jqueryMap.$left.css({ display: "block" });
        jqueryMap.$leftup.css({ display: "block" });
      break;

      case 'hidden' :
        height_px    = 0;
        width_px     = stateMap.slider_closed_width_px;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text  = '+';
        jqueryMap.$up.css({ display: "none" });
        // jqueryMap.$rightup.css({ display: "none" });
        // jqueryMap.$right.css({ display: "none" });
        // jqueryMap.$rightdown.css({ display: "none" });
        // jqueryMap.$down.css({ display: "none" });
        // jqueryMap.$leftdown.css({ display: "none" });
        jqueryMap.$left.css({ display: "none" });
        jqueryMap.$leftup.css({ display: "none" });
      break;

      case 'closed' :
        height_px    = stateMap.slider_closed_height_px;
        width_px     = stateMap.slider_closed_width_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text  = '+';
        jqueryMap.$up.css({ display: "none" });
        // jqueryMap.$rightup.css({ display: "none" });
        // jqueryMap.$right.css({ display: "none" });
        // jqueryMap.$rightdown.css({ display: "none" });
        // jqueryMap.$down.css({ display: "none" });
        // jqueryMap.$leftdown.css({ display: "none" });
        jqueryMap.$left.css({ display: "none" });
        jqueryMap.$leftup.css({ display: "none" });
        // jqueryMap.$sizer.css({ display: "none" });
      break;

      // bail for unknown position_type
      default : return false;
    }

    // animate slider position change
    stateMap.position_type = '';
    jqueryMap.$slider.animate(
      { height : height_px,
        width  : width_px },
      animate_time,
      function () {
        jqueryMap.$toggle.prop( 'title', slider_title );
        jqueryMap.$toggle.text( toggle_text );
        stateMap.position_type = position_type;
        saveChatDimension();
        if ( callback ) { callback( jqueryMap.$slider ); }
      }
    );

    return true;
  };
  // End public DOM method /setSliderPosition/

  setModalOverlay = function ( $elem, $href ) {
    var modal_overlay = configMap.modal_overlay;
    $elem.attr('href', $href);
    modal_overlay($elem);

    return true;
  };

  // Begin private DOM methods to manage chat message
  scrollChat = function() {
    var $msg_log = jqueryMap.$msg_log; 
    $msg_log.animate( 
      { scrollTop : $msg_log.prop( 'scrollHeight' ) 
        - $msg_log.height() 
      }, 
      150 
    ); 
  };

  writeAlert = function ( alert_text ) {
    jqueryMap.$msg_log.append( 
      '<div class="spa-chat-msg-log-alert">' 
        + spa.util_b.encodeHtml(alert_text) 
      + '</div>' 
    ); 

    scrollChat(); 
  };

  clearChat = function () { 
    jqueryMap.$msg_log.empty();
    stateMap.messages = {};
    stateMap.last_message = {};
  };
  // End private DOM methods to manage chat message
  //---------------------- END DOM METHODS ---------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onTapToggle = function ( event ){
    var set_chat_anchor = configMap.set_chat_anchor;
    if ( stateMap.position_type === 'opened' ) {
      set_chat_anchor( 'closed' );
    }
    else if ( stateMap.position_type === 'closed' ){
      set_chat_anchor( 'opened' );
    }

    return false;
  };

  onSubmitMsg = function ( event ) {
    var msg_text = jqueryMap.$input.val(); 
    if ( msg_text.trim() === '' ) { return false; }
    configMap.chat_model.send_msg( msg_text ); 
    jqueryMap.$input.focus(); 
    jqueryMap.$send.addClass( 'spa-x-select' ); 
    setTimeout( 
      function () { jqueryMap.$send.removeClass( 'spa-x-select' ); }, 
      250 
    );

    return false; 
  };

  onTapList = function ( event ) {
    var $tapped = $( event.elem_target ), chatee_id;
    // handler when tap pending-bx
    if ( $tapped.hasClass('spa-chat-pending-box') ) {

      // if already selected, directly return
      if ( stateMap.pending_selected ) { return false; }

      stateMap.pending_selected = true;
      jqueryMap.$msg_log.html(stateMap.pending_messages);

      // remove all friends' select status
      jqueryMap.$list_box 
        .find( '.spa-chat-list-name' ) 
        .removeClass( 'spa-x-select' );

      // remove invited_box select status
      if ( stateMap.invited_selected ) {
        jqueryMap.$invited_box.removeClass( 'spa-notify-select' );
        stateMap.invited_selected = false;
      }      

      // add select css style
      jqueryMap.$pending_box.addClass( 'spa-notify-select' );

      // bind accept event for each pending invitation
      jqueryMap.$msg_log.find( '.spa-chat-pending-accept' ).click(function () {
        var user, userID, userCSS, friend, friendID, friendBG, $self;
        
        user     = configMap.people_model.get_user().name;
        userID   = configMap.people_model.get_user()._id;
        userCSS  = configMap.people_model.get_user().css_map;
        userCSS.top = getRandPosition();
        userCSS.left = getRandPosition();
        $self    = $(this);
        friend   = $self.prev().text();
        friendID = $self.parent().attr( 'pending-id' );
        friendBG = $self.parent().find('.spa-chat-person-avatar').css('background-color');
        configMap.chat_model.accept_invite({
          'invitee' : {
            'id'      : userID,
            'name'    : user,
            'css_map' : userCSS
          },
          'inviter' : {
            'id'   : friendID,
            'name' : friend,
            'css_map' : {
              'top' : getRandPosition(),
              'left' : getRandPosition(),
              'background-color' : friendBG
            }
          }
        });
      });

      // deny event will be implemented in the future
      jqueryMap.$msg_log.find( '.spa-chat-pending-deny' ).click(function () {
      });

      // clear chatee to null
      configMap.chat_model.set_chatee( null );
    } else if ( $tapped.hasClass('spa-chat-invited-box') ) {
      if ( stateMap.invited_selected ) { return false; }
      stateMap.invited_selected = true;
      jqueryMap.$msg_log.html(stateMap.invited_messages);
      
      jqueryMap.$list_box 
        .find( '.spa-chat-list-name' ) 
        .removeClass( 'spa-x-select' );

      if ( stateMap.pending_selected ) {
        jqueryMap.$pending_box.removeClass( 'spa-notify-select' );
        stateMap.pending_selected = false;
      }      

      jqueryMap.$invited_box.addClass( 'spa-notify-select' );

      jqueryMap.$msg_log.find( '.spa-chat-invited-cancel' ).click(function () {
      });

      configMap.chat_model.set_chatee( null );

    } else if ( $tapped.hasClass('spa-chat-list-name') ) {

      if ( stateMap.invited_selected ) {
        jqueryMap.$invited_box.removeClass( 'spa-notify-select' );
        stateMap.invited_selected = false;
      }      

      if ( stateMap.pending_selected ) {
        jqueryMap.$pending_box.removeClass( 'spa-notify-select' );
        stateMap.pending_selected = false;
      }    

      chatee_id = $tapped.attr( 'data-id' ); 
      if ( !chatee_id ) { return false; }      
      configMap.chat_model.set_chatee( chatee_id );
    } else {
      return false;
    }

    return false; 
  };

  onSetchatee = function ( event, arg_map ) {
    var 
      new_chatee = arg_map.new_chatee, 
      old_chatee = arg_map.old_chatee; 

    jqueryMap.$input.focus();

    if ( !new_chatee ) {
      // temp comment out
      // if ( old_chatee ) {
      //   writeAlert( old_chatee.name + ' has left the chat' ); 
      // } 
      // else { 
      //   writeAlert( 'Your friend has left the chat' ); 
      // }

      jqueryMap.$title.text( 'Chat' );

      return false; 
    }

    jqueryMap.$list_box 
      .find( '.spa-chat-list-name' ) 
      .removeClass( 'spa-x-select' ) 
      .end() 
      .find( '[data-id=' + new_chatee.id + ']' ) 
      .addClass( 'spa-x-select' ); 

    jqueryMap.$title.text( 'Chat with ' + new_chatee.name );

    jqueryMap.$msg_log.html(stateMap.messages[new_chatee.id]);

    jqueryMap.$msg_log.prop({
      scrollTop :
        jqueryMap.$msg_log.prop( 'scrollHeight' ) 
        - jqueryMap.$msg_log.height()
    });

    return true; 
  };

  onListchange = function ( event, arg_map ){
    var 
      list_html = String(), 
      user    = arg_map[0].user,
      friends = arg_map[0].friends,
      pending = arg_map[0].pending,
      invited = arg_map[0].invited,
      chatee = configMap.chat_model.get_chatee(),
      friend_id, friend, i, len, message, msg_class, bg_color, msg_date, select_class,
      bottom, height;

    stateMap.user    = arg_map[0].user;
    stateMap.friends = arg_map[0].friends;
    stateMap.pending = arg_map[0].pending;
    stateMap.invited = arg_map[0].invited;

    for ( friend_id in friends ) {
      if (friends.hasOwnProperty(friend_id)) {
        select_class = ''; 
        friend = friends[friend_id];
  
        if ( chatee && chatee.id === friend_id ) { 
          select_class=' spa-x-select'; 
        } 
  
        list_html 
          += '<div class="spa-chat-list-name' 
          + select_class + '" data-id="' + friend_id + '">' 
          + spa.util_b.encodeHtml( friend.name ) + '</div>';

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
        stateMap.messages[friend_id] =  "";
        for (i = 0, len = friend.messages.length; i < len; i++) {
          message = friend.messages[i];
          msg_class = message.sender_id === friend_id ? 
            'spa-chat-msg-log-msg' : 'spa-chat-msg-log-me';

          bg_color = message.sender_id === friend_id ? 
            friend.css_map['background-color'] : user.css_map['background-color'] ;

          if (message.time - stateMap.last_message[friend_id] > 30000) {
            msg_date = (new Date(message.time)).toString().slice(4, 21);
            stateMap.messages[friend_id] += '<div class="spa-chat-msg-log-date">' + msg_date + '</div>';
          }

          stateMap.last_message[friend_id] = message.time;

          stateMap.messages[friend_id] += '<div class="' + msg_class + '">' +
            '<div class="spa-chat-msg-log-flag"></div>' +
            '<div class="spa-chat-msg-log-sender" style="background-color: ' + bg_color + '">' +
            spa.util_b.encodeHtml(message.sender_name) + '</div>' + 
            spa.util_b.encodeHtml(message.message_text) + '</div>';
        }
      }
    }

    jqueryMap.$list_box.html( list_html ); 

    // handle pending/invited message info
    if ( pending && pending.length > 0 ) {
      len = pending.length;
      stateMap.pending_exist = true;
      jqueryMap.$pending_badge.text( len );

      list_html = '';
      for (i = 0; i < len; i++) {
        list_html = list_html +
          '<div class="spa-chat-pending-message" pending-id="' + pending[i].id + '">' +
            '<div class="spa-chat-person-avatar" style="background-color: ' +
               pending[i].css_map['background-color'] + '"></div>' +
            '<div class="spa-chat-person-name">' + spa.util_b.encodeHtml( pending[i].name ) + '</div>' +
            '<div class="spa-chat-pending-accept">Accept</div>' +
            '<div class="spa-chat-pending-deny">Deny</div>' +
          '</div>';
      }

      stateMap.pending_messages = list_html;
    }

    if ( invited && invited.length > 0 ) {
      len = invited.length;
      stateMap.invited_exist = true;
      jqueryMap.$invited_badge.text( len );

      list_html = '';
      for (i = 0; i < len; i++) {
        list_html = list_html +
          '<div class="spa-chat-invited-message" invited-id="' + invited[i].id + '">' +
            '<div class="spa-chat-person-avatar" style="background-color: ' +
               invited[i].css_map['background-color'] + '"></div>' +
            '<div class="spa-chat-person-name">' + spa.util_b.encodeHtml( invited[i].name ) + '</div>' +
            '<div class="spa-chat-invited-cancel">Cancel</div>' +
          '</div>';
      }

      stateMap.invited_messages = list_html;
    }

    if ( stateMap.pending_exist && stateMap.invited_exist ) {
      bottom = parseFloat(jqueryMap.$list_box.css( 'bottom' ));
      // handle firefox bug
      if (/firefox/.test(navigator.userAgent.toLowerCase())) { bottom += 25.6; }
      height = spa.util_b.getCurrentStyle(jqueryMap.$invited_box.get(0), 'height' );
      bottom += height;
      jqueryMap.$invited_box.css({'display' : 'block'});
      height = spa.util_b.getCurrentStyle(jqueryMap.$pending_box.get(0), 'height' );
      bottom += height;        
      jqueryMap.$pending_box.css({'display' : 'block'});
      jqueryMap.$list_box.css({'bottom' : bottom});
    } else if ( stateMap.pending_exist ) {
      bottom = parseFloat(jqueryMap.$list_box.css( 'bottom' ));
      // handle firefox bug
      if (/firefox/.test(navigator.userAgent.toLowerCase())) { bottom += 25.6; }
      jqueryMap.$pending_box.css({'display' : 'block', 'bottom' : bottom});
      height = spa.util_b.getCurrentStyle(jqueryMap.$pending_box.get(0), 'height' );
      bottom += height;
      jqueryMap.$list_box.css({'bottom' : bottom});
    } else if ( stateMap.invited_exist ) {
      bottom = parseFloat(jqueryMap.$list_box.css( 'bottom' ));
      // handle firefox bug
      if (/firefox/.test(navigator.userAgent.toLowerCase())) { bottom += 25.6; }
      jqueryMap.$invited_box.css({'display' : 'block', 'bottom' : bottom});
      height = spa.util_b.getCurrentStyle(jqueryMap.$invited_box.get(0), 'height' );
      bottom += height;
      jqueryMap.$list_box.css({'bottom' : bottom});
    }
  };

  onUpdatechat = function ( event, msg_map ) {
    var 
      is_user, msg_class, msg_identifier, msg_body, msg_date, bg_color,
      time          = msg_map.time,
      sender_id     = msg_map.sender_id,
      sender_name   = msg_map.sender_name,
      receiver_id   = msg_map.receiver_id,
      receiver_name = msg_map.receiver_name,
      message_text  = msg_map.message_text, 
      chatee        = configMap.chat_model.get_chatee() || {}, 
      user          = configMap.people_model.get_user(), 
      user_id       = user._id; 

    is_user = sender_id === user_id;

    if ( !(is_user || user.friends[sender_id]) ) {
      writeAlert( message_text ); 
      return false; 
    }

    // followings are temporarily commented out
    // seems there are redundant code in chat model
    // if ( ! ( is_user || sender_id === chatee.id ) ) {
    //   configMap.chat_model.set_chatee( sender_id ); 
    // }

    if (is_user) {
      msg_class = 'spa-chat-msg-log-me';
      msg_identifier = receiver_id;
      bg_color = user.css_map['background-color'];
    } else {
      msg_class = 'spa-chat-msg-log-msg'; 
      msg_identifier = sender_id;
      bg_color = user.friends[sender_id].css_map['background-color'];
    }

    msg_body = '<div class="' + msg_class + '">' +
      '<div class="spa-chat-msg-log-flag"></div>' +
      '<div class="spa-chat-msg-log-sender" style="background-color: ' + bg_color + '">' +
      spa.util_b.encodeHtml(sender_name) + '</div>' + 
      spa.util_b.encodeHtml(message_text) + '</div>';

    // show message time every 30s
    if (time - stateMap.last_message[msg_identifier] > 30000) {
      msg_date = (new Date(time)).toString().slice(4, 21);
      msg_body = '<div class="spa-chat-msg-log-date">' + msg_date + '</div>' + msg_body;
    }

    stateMap.last_message[msg_identifier] = time;
    jqueryMap.$msg_log.append( msg_body );
    scrollChat(); 

    stateMap.messages[msg_identifier] += msg_body;
    
    if ( is_user ) { 
      jqueryMap.$input.val( '' ); 
      jqueryMap.$input.focus();
    } 
  };

  // response from server to invitee when click on accept button
  // update the friend list by adding the new friend name, and
  // update pending_badge count by decrease 1
  onAcceptinvite = function (event, accept_map) {
    var pending_item, bottom, height, friend_idx,
      pending = stateMap.pending,
      i = 0,
      len = pending.length,
      list_html = '',
      friend = accept_map[0].name,
      friendID = accept_map[0].id;

      // add new friend name to frient list
      list_html = String() +
        '<div class="spa-chat-list-name" data-id="' + friendID + '">' +
        spa.util_b.encodeHtml( friend ) + '</div>';

      // update stateMap.friends by adding new friends
      stateMap.friends[friendID]  = accept_map[0];
      stateMap.messages[friendID] = '';
      stateMap.last_message[friendID] = 0;

      jqueryMap.$list_box.append( list_html );

      list_html = '';

      // update badge and msg_log
      if (len === 1) {
        // update the pending_badge, calculate the new css style for $list_box,
        // and hide the pending_box
        jqueryMap.$pending_badge.text(--len);
        bottom = parseFloat(jqueryMap.$list_box.css( 'bottom' ));
        height = spa.util_b.getCurrentStyle(jqueryMap.$pending_box.get(0), 'height' );
        bottom -= height;        
        jqueryMap.$pending_box.css({'display' : 'none'});
        jqueryMap.$list_box.css({'bottom' : bottom});
        stateMap.pending_messages = '';
        stateMap.pending_exist = false;
        stateMap.pending = null;

        // if pending_box is selected, directly remove the pending_info for the friendID
        // and show the default greeting info in $msg_log
        if (stateMap.pending_selected) {
          stateMap.pending_selected = false;
          jqueryMap.$msg_log.html( '<div class="spa-chat-greeting-message">vanTalk</div>' );
        }
      } else {
        // update the stateMap.pending_messages, need find the pending_info by a loop
        // using friendID
        for (i; i < len; i++) {
          pending_item = pending[i];
          if (pending_item.id !== friendID) {
            list_html = list_html +
              '<div class="spa-chat-pending-message" pending-id="' + pending_item.id + '">' +
                '<div class="spa-chat-person-avatar" style="background-color: ' +
                   pending_item.css_map['background-color'] + '"></div>' +
                '<div class="spa-chat-person-name">' + spa.util_b.encodeHtml( pending_item.name ) + '</div>' +
                '<div class="spa-chat-pending-accept">Accept</div>' +
                '<div class="spa-chat-pending-deny">Deny</div>' +
              '</div>';
          } else {
            friend_idx = i;
          }
        }
        stateMap.pending_messages = list_html;

        // also need to update the stateMap.pending by removing the friendID pending_info
        // corresponding to stateMap.pending_messages
        stateMap.pending.splice(friend_idx, 1);

        // update pending_badge by reduce 1
        jqueryMap.$pending_badge.text(--len);

        // if pending_box is selected, directly remove the pending_info for the friendID
        if (stateMap.pending_selected) {
          jqueryMap.$msg_log.find( '.spa-chat-pending-message' ).each(function () {
            var $self = $(this);
            if ( friendID === $self.attr( 'pending-id' )) {
              $self.css({'display': 'none'});
            }
          });
        }
      }

    return false;
  };
  
  // friend invitation of other guys from server to me
  // update the pending_message by new coming invitation
  // update pending_badge count by increase 1.
  onInviterequest = function (event, request_map) {
    var list_html, len, bottom, height,
      friend   = request_map[0].name,
      friendID = request_map[0].id,
      friendCSS = request_map[0].css_map;

      // update the pending_message and rebind accept event
      list_html = String() +
        '<div class="spa-chat-pending-message" pending-id="' + friendID + '">' +
          '<div class="spa-chat-person-avatar" style="background-color: ' +
             friendCSS['background-color'] + '"></div>' +
          '<div class="spa-chat-person-name">' + spa.util_b.encodeHtml( friend ) + '</div>' +
          '<div class="spa-chat-pending-accept">Accept</div>' +
          '<div class="spa-chat-pending-deny">Deny</div>' +
        '</div>';

      stateMap.pending_messages += list_html;

      // update stateMap.pending by push the new friend invitation
      stateMap.pending.push( request_map[0] );

      len = jqueryMap.$pending_badge.text();
      jqueryMap.$pending_badge.text(++len);

      if ( stateMap.pending_exist ) {
        if ( stateMap.pending_selected ) {
          jqueryMap.$msg_log.append( list_html );
          jqueryMap.$msg_log.find( '.spa-chat-pending-accept' ).click(function () {
            var user, userID, userCSS, friend, friendID, friendBG, $self;
            
            user     = configMap.people_model.get_user().name;
            userID   = configMap.people_model.get_user()._id;
            userCSS  = configMap.people_model.get_user().css_map;
            userCSS.top = getRandPosition();
            userCSS.left = getRandPosition();
            $self    = $(this);
            friend   = $self.prev().text();
            friendID = $self.parent().attr( 'pending-id' );
            friendBG = $self.parent().find('.spa-chat-person-avatar').css('background-color');

            configMap.chat_model.accept_invite({
              'invitee' : {
                'id'      : userID,
                'name'    : user,
                'css_map' : userCSS
              },
              'inviter' : {
                'id'   : friendID,
                'name' : friend,
                'css_map' : {
                  'top' : getRandPosition(),
                  'left' : getRandPosition(),
                  'background-color' : friendBG
                }
              }
            });
          });

          jqueryMap.$msg_log.find( '.spa-chat-pending-deny' ).click(function () {
          });
        }
      } else {
        bottom = parseFloat(jqueryMap.$list_box.css( 'bottom' ));          
        height = spa.util_b.getCurrentStyle(jqueryMap.$pending_box.get(0), 'height' );
        jqueryMap.$pending_box.css({'display' : 'block', 'bottom' : bottom});
        bottom += height;
        jqueryMap.$list_box.css({'bottom' : bottom});

        stateMap.pending_exist = true;
      }

      return true;

  };

  // response from server to inviter about whether his
  // invitation has been sent
  // update the pending_message by adding the new friend
  // name, and update pending_badge count by increase 1
  onInvitefriend = function (event, invite_map) {
    var list_html, len, bottom, height,
      friend   = invite_map[0].name,
      friendID = invite_map[0].id,
      friendCSS = invite_map[0].css_map;

      // update the invited_message and rebind cancel event
      list_html = String() +
        '<div class="spa-chat-invited-message" invited-id="' + friendID + '">' +
          '<div class="spa-chat-person-avatar" style="background-color: ' +
             friendCSS['background-color'] + '"></div>' +
          '<div class="spa-chat-person-name">' + spa.util_b.encodeHtml( friend ) + '</div>' +
          '<div class="spa-chat-invited-cancel">Cancel</div>' +
        '</div>';

      stateMap.invited_messages += list_html;

      // update stateMap.invited by push the new sent invitation
      stateMap.invited.push( invite_map[0] );

      len = jqueryMap.$invited_badge.text();
      jqueryMap.$invited_badge.text(++len);

      if ( stateMap.invited_exist ) {
        if ( stateMap.invited_selected ) {
          jqueryMap.$msg_log.append( list_html );
          jqueryMap.$msg_log.find( '.spa-chat-invited-cancel' ).click(function () {
          });
        }
      } else {
        if ( stateMap.pending_exist ) {
          bottom = parseFloat(jqueryMap.$pending_box.css('bottom'));
          jqueryMap.$invited_box.css({'display' : 'block', 'bottom' : bottom});
          height = spa.util_b.getCurrentStyle(jqueryMap.$invited_box.get(0), 'height' );
          bottom += height;
          jqueryMap.$pending_box.css({'bottom' : bottom});
          bottom = parseFloat(jqueryMap.$list_box.css( 'bottom' ));
          bottom += height;
          jqueryMap.$list_box.css({'bottom' : bottom});
        } else {
          bottom = parseFloat(jqueryMap.$list_box.css( 'bottom' ));
          jqueryMap.$invited_box.css({'display' : 'block', 'bottom' : bottom});
          height = spa.util_b.getCurrentStyle(jqueryMap.$invited_box.get(0), 'height' );
          bottom += height;
          jqueryMap.$list_box.css({'bottom' : bottom});
        }

        stateMap.invited_exist = true;
      }

      return true;
  };

  // response from server about the invitee response to the invitation
  // the invitation may be accepted or denied. No matter what is the
  // repsonse, invited_badge count will be decreased by 1. If
  // the invitation is accepted, new friend name will be added into
  // the inviter friend list.
  onInviteresponse = function (event, response_map) {
    var invited_item, bottom, height, friend_idx,
      invited = stateMap.invited,
      i = 0,
      len = invited.length,
      list_html = '',
      friend   = response_map[0].name,
      friendID = response_map[0].id;

      // add new friend name to frient list
      list_html = String() +
        '<div class="spa-chat-list-name" data-id="' + friendID + '">' +
        spa.util_b.encodeHtml( friend ) + '</div>';

      // update stateMap.friends by adding new friends
      stateMap.friends[friendID]  = response_map[0];
      stateMap.messages[friendID] = '';
      stateMap.last_message[friendID] = 0;

      jqueryMap.$list_box.append( list_html );

      list_html = '';

      // update badge and msg_log
      if (len === 1) {
        // update the invited_badge, calculate the new css style for $list_box,
        // and hide the invited_box
        jqueryMap.$invited_badge.text(--len);
        if ( stateMap.pending_exist ) {
          bottom = parseFloat(jqueryMap.$pending_box.css('bottom'));
          jqueryMap.$list_box.css({'bottom' : bottom});
          bottom = parseFloat(jqueryMap.$invited_box.css('bottom'));
          jqueryMap.$pending_box.css({'bottom' : bottom});
        } else {
          bottom = parseFloat(jqueryMap.$invited_box.css('bottom'));
          jqueryMap.$list_box.css({'bottom' : bottom});
        }
        jqueryMap.$invited_box.css({'display' : 'none'});
        stateMap.invited_messages = '';
        stateMap.invited_exist = false;
        stateMap.invited = null;

        // if invited_box is selected, directly remove the invited_info for the friendID
        // and show the default greeting info in $msg_log
        if (stateMap.invited_selected) {
          stateMap.invited_selected = false;
          jqueryMap.$msg_log.html( '<div class="spa-chat-greeting-message">vanTalk</div>' );
        }
      } else {
        // update the stateMap.invited_messages, need find the invited_info by a loop
        // using friendID
        for (i; i < len; i++) {
          invited_item = invited[i];
          if (invited_item.id !== friendID) {
            list_html = list_html +
              '<div class="spa-chat-invited-message" invited-id="' + invited_item.id + '">' +
                '<div class="spa-chat-person-avatar" style="background-color: ' +
                   invited_item.css_map['background-color'] + '"></div>' +
                '<div class="spa-chat-person-name">' + spa.util_b.encodeHtml( invited_item.name ) + '</div>' +
                '<div class="spa-chat-invited-cancel">Cancel</div>' +
              '</div>';
          } else {
            friend_idx = i;
          }
        }
        stateMap.invited_messages = list_html;

        // also need to update the stateMap.invited by removing the friendID invited_info
        // corresponding to stateMap.invited_messages
        stateMap.invited.splice(friend_idx, 1);

        // update invited_badge by reduce 1
        jqueryMap.$invited_badge.text(--len);

        // if invited_box is selected, directly remove the invited_info for the friendID
        if (stateMap.invited_selected) {
          jqueryMap.$msg_log.find( '.spa-chat-invited-message' ).each(function () {
            var $self = $(this);
            if ( friendID === $self.attr( 'invited-id' )) {
              $self.css({'display': 'none'});
            }
          });
        }
      }

    return false;

  };

  onLogin = function ( event, login_user ) {
    // seems following will trigger base url for the second time
    // so directly open the chatter, does not run into issue till now.
    // configMap.set_chat_anchor( 'opened' );
    if (restoreChatDimension()) {
      if (stateMap.position_type === "opened") {
        setSliderPosition( 'opened' );
      }
    } else {
      setSliderPosition( 'opened' );
    }
  };

  onLogout = function ( event, logout_user ) {
    configMap.set_chat_anchor( 'closed' ); 
    jqueryMap.$title.text( 'Chat' );
   
    // restore previous loggin chat dimension
    stateMap.slider_opened_height_px = configMap.slider_opened_height_em * stateMap.px_per_em;
    stateMap.slider_opened_width_px  = configMap.slider_opened_width_em * stateMap.px_per_em;

    clearChat(); 
  };
  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin public method /configModule/
  // Example : spa.chat.configModule({ slider_opened_em : 18 });
  // Purpose : Configure the module prior to initialization
  // Arguments :
  //   * set_chat_anchor - a callback to modify the URI anchor to
  //                       indicate opened or closed state. This
  //                       callback must return false if the requ-
  //                       ested state cannot be met
  //   * chat_model      - the chat model object provides methods
  //                       to interact with our instant messaging
  //   * people_model    - the people model object which provides
  //                       methods to manage the list of people
  //                       the model maintains
  //   * slider_* settings. All these are optional scalars. See
  //                       mapConfig.settable_map for a full list
  //                       Example: slider_opened_em is the open
  //                       height in em's
  // Action :
  //   The internal configuration data structure (configMap) is
  //   updated with provided arguments. No other actions are taken.
  // Returns : true
  // Throws : JavaScript error object and stack trace on unacceptab-
  //          le or missing arguments
  //
  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });

    return true;
  };
  // End public method /configModule/

  // Begin public method /initModule/
  // Example : spa.chat.initModule( $('#div_id') );
  // Purpose : Directs Chat to offer its capability to the user
  // Arguments :
  //   * $append_target (example: $('#div_id')).
  //     A jQuery collection that should represent
  //     a single DOM container
  // Action :
  //   Appends the chat slider to the provided container and fills
  //   it with HTML content. It then initializes elements, events,
  //   and handlers to provide the user with a chat-room interface
  // Returns : true on success, false on failure
  // Throws : none
  //
  initModule = function ( $append_target ) {
    var $list_box;
    // load chat slider html and jquery cache
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    setPxSizes();
    // video and setting have not been implemented, temp comment them out
    // setModalOverlay( jqueryMap.$serve_video, "#spa-shell-video" );
    setModalOverlay( jqueryMap.$serve_search, "#spa-shell-search" );
    // setModalOverlay( jqueryMap.$serve_setting, "#spa-shell-setting" );

    // initialize chat slider to default title and state
    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
    stateMap.position_type = 'closed';
    // initialize resizable zone to none
    jqueryMap.$up.css({ display: "none" });
    jqueryMap.$rightup.css({ display: "none" });
    jqueryMap.$right.css({ display: "none" });
    jqueryMap.$rightdown.css({ display: "none" });
    jqueryMap.$down.css({ display: "none" });
    jqueryMap.$leftdown.css({ display: "none" });
    jqueryMap.$left.css({ display: "none" });
    jqueryMap.$leftup.css({ display: "none" });

    // Have $list_box subscribe to jQuery global events
    $list_box = jqueryMap.$list_box; 
    $.gevent.subscribe( $list_box, 'spa-listchange', onListchange );
    $.gevent.subscribe( $list_box, 'spa-setchatee', onSetchatee );
    $.gevent.subscribe( $list_box, 'spa-updatechat', onUpdatechat );
    // send friend invitation to other guys
    $.gevent.subscribe( $list_box, 'spa-invitefriend', onInvitefriend );
    // accept other guys' invitation
    $.gevent.subscribe( $list_box, 'spa-acceptinvite', onAcceptinvite );
    // sent invitation response from other guys (accept or deny)
    $.gevent.subscribe( $list_box, 'spa-inviteresponse', onInviteresponse );
    // invitation from other guys 
    $.gevent.subscribe( $list_box, 'spa-inviterequest', onInviterequest ); 
    $.gevent.subscribe( $list_box, 'spa-login', onLogin ); 
    $.gevent.subscribe( $list_box, 'spa-logout', onLogout );

    // bind user input events
    jqueryMap.$head.bind( 'utap', onTapToggle ); 
    jqueryMap.$list_box.bind( 'utap', onTapList ); 
    jqueryMap.$pending_box.bind( 'utap', onTapList ); 
    jqueryMap.$invited_box.bind( 'utap', onTapList ); 
    jqueryMap.$send.bind( 'utap', onSubmitMsg ); 
    // need further study about the submit mechanism
    jqueryMap.$form.bind( 'submit', onSubmitMsg );

    return true;
  };
  // End public method /initModule/

  // Begin public method /removeSlider/
  // Purpose :
  //   * Removes chatSlider DOM element
  //   * Reverts to initial state
  //   * Removes pointers to callbacks and other data
  // Arguments : none
  // Returns : true
  // Throws : none
  //
  removeSlider = function () {
    // unwind initialization and state
    // remove DOM container; this removes event bindings too
    if ( jqueryMap.$slider ) {
      jqueryMap.$slider.remove();
      jqueryMap = {};
    }

    stateMap.$append_target = null;
    stateMap.position_type = 'closed';

    // unwind key configurations
    configMap.chat_model = null;
    configMap.people_model = null;
    configMap.set_chat_anchor = null;

    return true;
  };
  // End public method /removeSlider/

  // Begin public method /handleResize/
  // Purpose :
  //   Given a window resize event, adjust the presentation
  //   provided by this module if needed
  // Actions :
  //   If the window height or width falls below a given
  //   threshold, resize the chat slider for the reduced
  //   window size.
  // Returns : Boolean
  //   * false - resize not considered
  //   * true  - resize considered
  // Throws : none
  //
  handleResize = function () {
    // don't do anything if we don't have a slider container
    if ( ! jqueryMap.$slider ) { return false; }
    setPxSizes();
    if ( stateMap.position_type === 'opened' ){
      jqueryMap.$slider.css({ height : stateMap.slider_opened_height_px,
                              width  : stateMap.slider_opened_width_px });
    }
    return true;
  };
  // End public method /handleResize/

  // Begin public method /handleResize/
  handleDragResize = function () {
    var idx, len,
        dragResizeElement = jqueryMap.$slider.get(0),
        dragResizeTarget  = null,
        dragResizeCursor  = "auto",
        dragResizeDeltaX  = 0,
        dragResizeDeltaY  = 0,
        dragResizeElementWidth  = 0,
        dragResizeElementHeight = 0,
        dragResizeClientX = 0,
        dragResizeClientY = 0,
        dragResizeCursorStack = [],
        dragResizeCursorObj = null;

    function dragResizeHandler ( evt ) {
      var event  = evt || window.event,
          target = event.target || event.srcElement,
          cursor = spa.util_b.getCurrentStyle(target, "cursor", "string");
      switch (event.type) {
        case "mousedown":
          if (target.className.indexOf("spa-chat-resizable") > -1) {
            console.log("Drag begin @ %o on %o", dragResizeTarget, dragResizeElement);
            dragResizeTarget = target;
            dragResizeClientX = event.clientX;
            dragResizeClientY = event.clientY;
            dragResizeCursor = spa.util_b.getCurrentStyle(dragResizeTarget, "cursor", "string");
            dragResizeElementWidth  = spa.util_b.getCurrentStyle(dragResizeElement, "width");
            dragResizeElementHeight = spa.util_b.getCurrentStyle(dragResizeElement, "height");
            dragResizeDeltaX = dragResizeClientX - dragResizeElement.offsetLeft;
            dragResizeDeltaY = dragResizeClientY - dragResizeElement.offsetTop;
          }
          break;
        case "mousemove":
          if (dragResizeTarget !== null) {
            // console.log("continue @ %f on %f", dragResizeClientX, dragResizeClientY);
            if (dragResizeTarget.id === "spa-chat-up") {
              // controlled by bottom and height, no need to further calculate the top
              // if using top, the $slider will scroll to top (title direction), rather than scrolling to the bottom
              // the same to the left property
              // dragResizeElement.style.top =                           event.clientY     - dragResizeDeltaY + "px";
              dragResizeElement.style.height = dragResizeElementHeight + dragResizeClientY - event.clientY    + "px";
            } else if (dragResizeTarget.id === "spa-chat-rightup") {
              // dragResizeElement.style.top =                           event.clientY     - dragResizeDeltaY + "px";
              dragResizeElement.style.height = dragResizeElementHeight + dragResizeClientY - event.clientY    + "px";
              dragResizeElement.style.width  = dragResizeElementWidth  - dragResizeClientX + event.clientX    + "px";
            } else if (dragResizeTarget.id === "spa-chat-right") {
              dragResizeElement.style.width  = dragResizeElementWidth  - dragResizeClientX + event.clientX    + "px";
            } else if (dragResizeTarget.id === "spa-chat-rightdown") {
              dragResizeElement.style.height = dragResizeElementHeight - dragResizeClientY + event.clientY    + "px";
              dragResizeElement.style.width  = dragResizeElementWidth  - dragResizeClientX + event.clientX    + "px";
            } else if (dragResizeTarget.id === "spa-chat-down") {
              dragResizeElement.style.height = dragResizeElementHeight - dragResizeClientY + event.clientY    + "px";
            } else if (dragResizeTarget.id === "spa-chat-leftdown") {
              // dragResizeElement.style.left =                          event.clientX     - dragResizeDeltaX + "px";
              dragResizeElement.style.width  = dragResizeElementWidth  + dragResizeClientX - event.clientX    + "px";
              dragResizeElement.style.height = dragResizeElementHeight - dragResizeClientY + event.clientY    + "px";
            } else if (dragResizeTarget.id === "spa-chat-left") {
              // dragResizeElement.style.left =                          event.clientX     - dragResizeDeltaX + "px";
              dragResizeElement.style.width  = dragResizeElementWidth  + dragResizeClientX - event.clientX    + "px";
            } else if (dragResizeTarget.id === "spa-chat-leftup") {
              // dragResizeElement.style.top  =                          event.clientY     - dragResizeDeltaY  + "px";
              // dragResizeElement.style.left =                          event.clientX     - dragResizeDeltaX  + "px";
              dragResizeElement.style.height = dragResizeElementHeight + dragResizeClientY - event.clientY     + "px";
              dragResizeElement.style.width  = dragResizeElementWidth  + dragResizeClientX - event.clientX     + "px";
            }

            stateMap.slider_opened_height_px = parseFloat(dragResizeElement.style.height);
            stateMap.slider_opened_width_px  = parseFloat(dragResizeElement.style.width);   

            // guarantee the minimal chat dimension
            if (configMap.slider_opened_height_em * stateMap.px_per_em >= stateMap.slider_opened_height_px) {
              stateMap.slider_opened_height_px = configMap.slider_opened_height_em * stateMap.px_per_em;
              dragResizeElement.style.height   = stateMap.slider_opened_height_px + "px";
            }

            if (configMap.slider_opened_width_em * stateMap.px_per_em >= stateMap.slider_opened_width_px) {
              stateMap.slider_opened_width_px = configMap.slider_opened_width_em * stateMap.px_per_em;
              dragResizeElement.style.width   = stateMap.slider_opened_width_px + "px";
            }
            
            saveChatDimension();

          }
          break;
        case "mouseover":
          if (dragResizeTarget !== null && target !== dragResizeTarget) {
            if (dragResizeCursor !== cursor) {
              if (target.dragcursor === undefined || target.dragcursor === false) {
                target.dragcursor = true;
                target.style.cursor = dragResizeCursor;
                dragResizeCursorObj = {elem: target, cursor: cursor};
                dragResizeCursorStack.push(dragResizeCursorObj);
              }
            }
          }
          break;
        case "mouseup":
          if (dragResizeTarget) {
            console.log("Drag end @ %o on %o", dragResizeTarget, dragResizeElement);

            len = dragResizeCursorStack.length;
            for (idx = 0; idx < len; idx++) {
              dragResizeCursorObj = dragResizeCursorStack[idx];
              dragResizeCursorObj.elem.dragcursor = false;
              dragResizeCursorObj.elem.style.cursor = dragResizeCursorObj.cursor;
            }
            dragResizeTarget = null;
            dragResizeCursorStack = [];

          }
          break;
      }
    }

    return dragResizeHandler;
  };


  // return public methods
  return {
    setSliderPosition : setSliderPosition,
    configModule      : configModule,
    initModule        : initModule,
    removeSlider      : removeSlider,
    handleResize      : handleResize,
    handleDragResize  : handleDragResize
  };
  //------------------- END PUBLIC METHODS ---------------------
}());