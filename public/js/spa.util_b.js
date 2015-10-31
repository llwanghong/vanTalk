/*
 * spa.util_b.js
 * JavaScript browser utilities
 *
 * Compiled by Michael S. Mikowski - mmikowski at gmail dot com
 * These are routines I have created, compiled, and updated
 * since 1998, with inspiration from around the web.
 *
 * MIT License
 */

/*jslint  browser : true,  continue : true,   devel   : true,
          indent  : 2,     maxerr   : 50,     newcap  : true,
          nomen   : true,  plusplus : true,   regexp  : true,
          sloppy  : true,  vars     : false,  white   : true
 */

/*global $, spa, getComputedStyle*/

spa.util_b = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      regex_encode_html : /[ &"'><]/g,
      regex_decode_html : /(?:&#160;|&#38;|&#34;|&#39;|&#62;|&#60;)/g,
      // regex_encode_html  : /[ &"'><]/g,
      // regex_encode_noamp : /[ "'><]/g,

      html_encode_map    : {
        ' ' : '&#160;', // '&nbsp;',
        '&' : '&#38;',  // '&amp;',
        '"' : '&#34;',  // '&quot;',
        "'" : '&#39;',  // IE does not support '&apos;'
        '>' : '&#62;',  // '&gt;',
        '<' : '&#60;'   // '&lt;'
      },

      html_decode_map    : {
        '&#160;' : ' ',
        '&#38;'  : '&',
        '&#34;'  : '"',
        '&#39;'  : "'",
        '&#62;'  : '>',
        '&#60;'  : '<'
      }
    },

    decodeHtml, encodeHtml,
    decodeHtml2, encodeHtml2,
    getEmSize, getCurrentStyle;

  // configMap.encode_noamp_map =$.extend(
  //   {}, configMap.html_encode_map
  // );
  // delete configMap.encode_noamp_map['&'];
  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGINUTILITY METHODS ------------------
  // Begin decodeHtml
  // Decodes HTML entities in a browser-friendly way
  // See http://stackoverflow.com/questions/1912501/\
  //   unescape-html-entities-in-javascript
  //
  decodeHtml = function ( html ) {
    // return $('<div/>').html(str ||'').text();
    var text,
      div = document.createElement("div");
    
    div.innerHTML = html;
    text = div.innerText || div.textContent;  // textContent is for IE
    div = null;

    return text;
  };
  //End decodeHtml

  // Begin encodeHtml
  // This is single pass encoder for html entities and handles
  // an arbitrary number of characters
  //
  encodeHtml = function ( text ){
    var html,
      div = document.createElement("div");

    if ( div.innerText ) {
      div.innerText = text;
    }
    else {
      div.textContent = text; // for IE
    }

    html = div.innerHTML;
    div  = null;

    return html;
  };
  // End encodeHtml

  // Begin decodeHtml2
  // Decodes HTML entities to special characters by regular expressions
  //
  decodeHtml2 = function ( html ) {
    // return $('<div/>').html(str ||'').text();
    var
      lookup_map = configMap.html_decode_map,
      regex      = configMap.regex_decode_html;
    
    return html.replace(regex,
      function (match) {
        return lookup_map[match];
      }
    );
  };
  //End decodeHtml2

  // Begin encodeHtml2
  // Encodes special characters to HTML entities by regular expressions
  //
  encodeHtml2 = function ( text ){
    var
      lookup_map = configMap.html_encode_map,
      regex      = configMap.regex_encode_html;

    return text.replace(regex,
      function (match) {
        return lookup_map[match];
      }
    );
  };
  // End encodeHtml2

  // Begin getEmSize
  // returns sizeof ems in pixels
  // 
  getEmSize = function ( elem) {
    return Number(
      getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
    );
  };
  // End getEmSize

  // Begin getCurrentStyle
  // returns value of specified style for given elements
  // 
  getCurrentStyle = function (elem, style, type) {
    var type = type || "number";
    if (type === "number") {
      return parseFloat(getComputedStyle( elem, '' )[style]);
    } else if (type === "string") {
      return getComputedStyle( elem, '' )[style];
    }
  };
  // End getCurrentStyle

  // export methods
  return {
    decodeHtml      : decodeHtml,
    encodeHtml      : encodeHtml,
    decodeHtml2     : decodeHtml2,
    encodeHtml2     : encodeHtml2,
    getEmSize       : getEmSize,
    getCurrentStyle : getCurrentStyle
  };
  //------------------- END PUBLIC METHODS---------------------
}());