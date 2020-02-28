const { fork } = require('child_process');

// set default timeout value for if config is incorrect or missing
// idleTimeout is how long it takes before the space is destroyed if there is no request
const defaults = {
  idleTimeout:3600000,
  paths:module.paths
}

// hold callbacks which are passed with newRequest
// the individual callbacks are stored by their id (random number) as key
const callbacks = {};

// separate process which contains all loaded packages
let space;

// store to be able to determin via function if space is still active (alive) or is allready destroyed
let isDestroyed;

// logic for handling request to and termination of space
module.exports = function(config){

  // set space options
  const idleTimeout = config.idleTimeout || defaults.idleTimeout;
  const paths = config.paths || defaults.paths;

  // function to destroy space on inactivity or function call
  function destroy(){
    // remote the timeout
    if(space.idleTimeout) clearTimeout(space.idleTimeout);
    // kill the space process
    space.kill();
    // set isSpaceDestroyed to true to check later if space is destroyed
    if(space.killed) isDestroyed = true;

    // // listen for messages coming from the space process
    // // if message comes, it should execute the right callback
    // space.off('message', (msg) => {
    // });

    // return the destroyed space
    return space
  }

  // function to fork new space if space doesnt exist
  function build(){
    space = fork('./space.js');

    // // listen for messages coming from the space process
    // // if message comes, it should execute the right callback
    // space.on('message', (msg) => {
    //   return msg;
    // });

    if(space) isDestroyed = false;
    return space;
  };

  // function to reset time idleTimout space timer
  function resetIdle(){
    if(space.idleTimeout) clearTimeout(space.idleTimeout);
    return space.idleTimeout = setTimeout(() => {
      destroySpace();
    }, idleTimeout);
  }

  // request to space
  // package is package name to use function on
  // func is function to call
  // parameters is function parameters, or parameters needed for new package loading
  // promise is boolean (true if package function returns promise)
  // type is (new for new package, get for executing function on existing package)
  // cb is callback when data is returned from space
  function newRequest(package, func, parameters, promise = false, type, cb){

    // create id to reference callback function
    let id = parseInt(Math.random() * 1000000);
    // store callback in callbacks object to later execute the cb function when to correct data is returned from space
    if(cb) callbacks[id] = cb;

    // new request object which also gets returned from space
    let req = {
      id:id,
      package:package,
      function:func,
      parameters:parameters,
      promise:promise,
      type:type,
      paths:paths
    }

    // reset idleTimeout timer for space because of activity (function call)
    resetIdle();

    // if request is made while space is allready killed then notify caller
    if(isDestroyed) return callbacks[req.id](req, false, 'Space is destroyed');

    // send the request to the space
    space.send(req);
  }

  // build first space on instantiation
  build();

  // return function to communicate with this module:
  // new: create new package in Space
  //
  // get: execute function on specified module in Space
  //
  // destroy: purposefully destroy space and return destroyed space object
  //
  // isSpaceDestroyed: check if space is destroyed
  //
  // resetIdle: reset idle timer/inactivity to prevent space is destroyed on inactivity
  return {
    add:function(package, parameters = [], cb = null){
      newRequest(package, false, parameters, false, 'new', cb);
    },
    get:function(package, func, parameters = [], promise = false, cb = null){
      newRequest(package, func, parameters, promise, 'get', cb);
    },
    destroy:function(){
      return destroy();
    },
    build:function(){
      return build();
    },
    isDestroyed:function(){
      return isDestroyed
    },
    resetIdle:function(){
      return resetIdle()
    }
  }
}
