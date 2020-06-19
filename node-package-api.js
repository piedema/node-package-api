const { fork } = require('child_process');

module.exports = function(config){

  const defaults = {
    inactivityTimeout:3600000,
    paths:module.paths
  }

  //id to be used for internal requests to space
  let lastId = 0

  const callbacks = {};                 // holds all callbacks from parent - key is req.id
  let space;                            // holds a reference to childprocess object
  let inactivityTimer = {};             // holds the timer for inactivity of the space

  // set space options
  const inactivityTimeout = config.inactivityTimeout || defaults.inactivityTimeout;
  const paths = config.paths || defaults.paths;

  /**
  * destroy/kill the space/childprocess object
  * @return {object} - returns space/childprocess object
  */
  function destroy(){
    clearTimeout(inactivityTimer);
    space.kill();
    return space
  }

  /**
  * create a new space/childprocess to contain packages and add a listener for messages
  * @return {object} - returns space/childprocess object
  */
  function build(){
    space = fork('./space.js');

    space.on('message', (msg) => {
      if(callbacks[msg.req.id]) callbacks[msg.req.id](msg.req, msg.status, msg.res);
    });

    return space;
  };

  /**
  * reset the inactivity timer to prevent desctruction of space after passing of inactivityTimeout
  * @return {object} - returns timer object
  */
  function resetInactivity(){
    clearTimeout(inactivityTimer);
    return inactivityTimer = setTimeout(() => {
      destroy();
    }, inactivityTimeout);
  }

  /**
  * a request to space (childprocess) for adding packages or calling functions
  * @param {string} package - Name of package (node_module)
  * @param {string} func - Name of function to call in package
  * @param {array} parameters - parameters of function to call
  * @param {boolean} promise - True if function returns a promise
  * @param {string} type - type of request
  * @param {function} cb - callback function to send data back to parent
  * @return {undefined}
  */
  function newRequest(package, func, parameters, isPromise, type, cb){
    let id = lastId++
    if(cb) callbacks[id] = cb;

    // new request object
    let req = {
      id:id,
      package:package,
      parameters:parameters,
      type:type
    }

    if(type === 'add') req.paths = paths;

    if(type === 'call'){
      req.function = func;
      req.isPromise = isPromise;
    }

    // reset inactivityTimeout timer for space because of activity (function call)
    resetInactivity();

    // if request is made while space is allready killed then notify caller
    if(space.killed) return callbacks[req.id](req, false, 'Space is not alive, build a space first');

    // send the request to the space
    space.send(req);
  }

  // build first space on instantiation
  build();

  return {

    /**
    * adds a new package to space
    * @param {string} package - Name of package (node_module)
    * @param {array} parameters - parameters needed if package returns function
    * @param {function} cb - callback function to send data back to parent
    * @return {undefined}
    */
    add:function(package, parameters = false, cb = null){
      newRequest(package, false, parameters, false, 'add', cb);
    },

    /**
    * calls a function in an existing package
    * @param {string} package - Name of package (node_module)
    * @param {string} func - name of function to call - separate nested functions with a '.'
    * @param {array} parameters - parameters to use in function call
    * @param {boolean} promise - true if function returns a promise, false if not
    * @param {function} cb - callback function to send data back to parent
    * @return {undefined}
    */
    call:function(package, func, parameters = [], isPromise = false, cb = null){
      newRequest(package, func, parameters, isPromise, 'call', cb);
    },

    /**
    * destroys a space/childprocess and ends all active scripts in it
    * @return {object} - returns the destroyed space
    */
    destroy:function(){
      return destroy();
    },

    /**
    * builds a new space/childprocess and creates a listener
    * @return {object} - returns the freshly created space
    */
    build:function(){
      return build();
    },

    /**
    * returns the status op the space/childprocess
    * @return {boolean} - returns the status of the space
    */
    isKilled:function(){
      return space.killed
    },

    /**
    * resets the inactivity timer of the space to avoid space destruction
    * @return {object} - returns the new timer object
    */
    resetInactivity:function(){
      return resetInactivity()
    }
  }
}
