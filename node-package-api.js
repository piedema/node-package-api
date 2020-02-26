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
const space = fork('./space.js');

// store to be able to determin via function if space is still active (alive) or is allready destroyed
let isSpaceDestroyed = false;

// listen for messages coming from the space process
// if message comes, it should execute the right callback
space.on('message', (msg) => {
  callbacks[msg.req.id](msg.req, msg.status, msg.res);
});

// logic for handling request to and termination of space
module.exports = function(config){

  // set space options
  const idleTimeout = config.idleTimeout || defaults.idleTimeout;
  const paths = config.paths || defaults.paths;

  // function to destroy space on inactivity or function call
  function destroySpace(){
    // remote the timeout
    if(space.idleTimeout) clearTimeout(space.idleTimeout);
    // kill the space process
    space.kill();
    // set isSpaceDestroyed to true to check later if space is destroyed
    if(space.killed) isSpaceDestroyed = true;
    // return the destroyed space
    return space
  }

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
  function newRequest(package, func, parameters, promise, type, cb){

    // create id to reference callback function
    let id = parseInt(Math.random() * 1000000);
    // store callback in callbacks object to later execute the cb function when to correct data is returned from space
    callbacks[id] = cb;

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
    if(isSpaceDestroyed) return callbacks[req.id](req, false, 'Space is allready destroyed');

    // send the request to the space
    space.send(req);
  }

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
    new:function(package, parameters = [], cb){
      newRequest(package, false, parameters, false, 'new', cb);
    },
    get:function(package, func, parameters = [], promise = false, cb){
      newRequest(package, func, parameters, promise, 'get', cb);
    },
    destroy:function(cb){
      cb(destroySpace());
    },
    isSpaceDestroyed:function(){
      return isSpaceDestroyed
    },
    resetIdle:function(){
      return resetIdle()
    }
  }
}
