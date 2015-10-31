/*
* crud.js - module to provideCRUD db capabilities
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
  loadSchema, checkSchema, clearIsOnline,
  checkType, constructObj, readObj,
  updateObj, destroyObj,

  dbHandle    = DBHANDLE,
  fsHandle    = require( 'fs'      ),
  JSV         = require( 'JSV'     ).JSV,
  assert      = require( 'assert'  ),
  validator   = JSV.createEnvironment(),
  schemaMap  = {};
// ------------- END MODULE SCOPE VARIABLES ---------------

// --------------- BEGIN UTILITY METHODS ----------------
loadSchema = function ( schema_path ) {
  fsHandle.readFile( schema_path, 'utf8', function ( err, data ) {
    schemaMap = JSON.parse( data );
  });
};

checkSchema = function ( obj_map, callback ) {
  var
    schema_map = schemaMap,
    report_map = validator.validate( obj_map, schema_map );
  
  callback( report_map.errors );
};

clearIsOnline = function () {
  updateObj(
    'user',
    { is_online : true },
    { is_online : false },
    function ( response_map ) {
      console.log( 'All users set to offline', response_map );
    }
  );
};
// ---------------- END UTILITY METHODS -----------------

// ---------------- BEGIN PUBLIC METHODS ------------------
checkType = function ( obj_type ) {
  if ( ! objTypeMap[ obj_type ] ) {
    return ({ error_msg : 'Object type "' + obj_type
      + '" is not supported.'
    });
  }

  return null;
};

constructObj = function ( object, obj_map, callback ) {
  checkSchema(
    obj_map,
    function ( error_list ) {
      if ( error_list.length === 0 ) {
        var options_map = { w: 1 };
        dbHandle.collection(object).insertOne(
          obj_map,
          options_map,
          function ( error, result_map ) {
            // console.log('constructed with: %j and get: %s', obj_map, result_map );
            callback( error, result_map.ops[0] ); // result_map.ops[0] contains the inserted user
          }
        );
      }
      else {
        callback({
          error_msg  : 'Input document not valid',
          error_list : error_list
        });
      }
    }
  );
};

readObj = function ( object, find_map, fields_map, callback ) {
  // console.log('dbHandle: ', dbHandle.collection(object))
  console.log('object: %s, find_map: %j, fields_map: %j, callback: %j', object, find_map, fields_map, callback);
  dbHandle.collection(object).find(
    find_map,
    fields_map
  ).toArray(
    function ( error, result_map ) {
      // console.log('readed with: %j and get: %j', find_map, result_map);
      callback( error, result_map );
    }
  );
};

updateObj = function ( object, find_map, update_map, callback ) {
  checkSchema(
    update_map,
    function ( error_list ) {
      if ( error_list.length === 0 ) {
        // for password reset, the find_map will crash after the
        // update, resetPasswordToken and resetPasswordExpires
        // will be cleaned
        // because of findOneAndUpdate bug, we temp need a workround
        // for password reset flow
        if (find_map.resetPasswordToken) {
          // we need first log the user corresponding to the find_map
          readObj(
            object,
            find_map,
            {},
            function ( error, result_map ) {
              var user = result_map[0];
              dbHandle.collection(object).updateOne(
                find_map,
                update_map,
                { w: 1, multi : false, upsert : true },
                function ( error, updated_map ) {
                  // console.log('find with %j and updated with: %j and get: %j', find_map, update_map, updated_map );
                  if (updated_map.result.ok === 1) {
                    readObj(
                      object,
                      {'name' : user.name},
                      {},
                      function ( error, result_map ) {
                        // console.log("updateObj result_map: ", result_map)
                        callback( error, result_map ); // result_map[0] contains the updated user
                      }
                    );
                  }
                }
              );
            }
          );
        }
        // find one bug of findOneAndUpdate in nodejs driver
        // it always return the object before update, rather
        // than the updated result
        else {
          dbHandle.collection(object).updateOne(
            find_map,
            update_map,
            { w: 1, multi : false, upsert : true },
            function ( error, updated_map ) {
              if (updated_map.result.ok === 1) {
                readObj(
                  object,
                  find_map,
                  {},
                  function ( error, result_map ) {
                    callback( error, result_map ); // result_map[0] contains the updated user
                  }
                );
              }
            }
          );
        }
      }
      else {
        callback({
          error_msg  : 'Input document not valid',
          error_list : error_list
        });
      }
    }
  );
};

destroyObj = function ( object, find_map, callback ) {
  var options_map = { w: 1, single: true };  
  dbHandle.collection(object).remove(
    find_map,
    options_map,
    function ( error, delete_count ) {
      // console.log('deleted with %j and delete %d', find_map, delete_count );
      callback( error, delete_count );
    }
  );
};

module.exports = {
  construct : constructObj, // create is a root method on Javascript Object prototype
  read      : readObj,
  update    : updateObj,
  destroy   : destroyObj  // delete is a reserved word in Javascript
};
// ----------------- END PUBLIC METHODS -----------------

// ------------- BEGIN MODULEINITIALIZATION --------------
// load schemas into memory (schemaMap)
(function () {
  var schema_path,
    isWin = /^win/.test(process.platform);

  if (isWin) {
    schema_path = __dirname + '\\schema.json';
  } else {
    schema_path = __dirname + '/schema.json';
  }

  console.log("Loading schema: %s", schema_path);
  loadSchema( schema_path );
}());
// ------------- END MODULE INITIALIZATION ---------------
