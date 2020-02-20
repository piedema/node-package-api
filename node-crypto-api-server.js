const ipc = require('node-ipc');

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

const apis = require('./apis/list.json');

const { fork } = require('child_process');

// object which contains all modules of all clients. each client will have a seperate process
// a space will be destroyed on a client disconnect or after in config specified time
const spaces = {};

// to handle websockets etc just open every socket.connect in new process and destroy process on disconnect

module.exports = function(config){

  // IPC SERVER
  // set config
  for(let key in config.ipc) ipc.config[key] = config.ipc[key];

  // ipc serve a listener for passing a module and function to run them
  ipc.serve(
    () => {
      ipc.server.on('#', (data, socket) => {
        get(data, (result) => {
          ipc.server.emit(socket, data.id, result);
        })
      });

      // on socket disconnect, close and delete the space and all containing modules.
      // a space is a seperate process so all related code is destroyed
      // do this to prevent open websockets which use bandwidt and processor power
      ipc.server.on('socket.disconnected', (socket, id) => {
        if(spaces[id]){
          spaces[id].kill();
          delete spaces[id];
        }
      });
    }
  )

  // start the server to listen for requests
  ipc.server.start();

  // EXPRESS SERVER ============= WILL BE ADDED LATER
  app.listen(config.express.port);

  // serve rest api and send request to get function.
  //on callback data will be send to client
  app.get('/_', (req, res) => {
    get(req.query, (result) => {
      res.send(result);
    })
  })

  /////// serve websocket to enable use of websockets in modules.
  // it is the clients responsability to close websockets in modules when they terminate http websocket.
  // if not terminated as should be, the the whole client space is destroyed to preserve bandwidth and processor
  app.ws('/_', function(ws, req) {
    // set isWs to make sure that an .on eventlistener is set in get function instead of .once
    req.query.isWS = true;
    // is isClientConnected is used to decide of message should be passed over http to client or space should be destroyed
    let isClientConnected = true;
    get(req.query, (result) => {
      // send request result if client is still connected
      if(isClientConnected) ws.send(JSON.stringify(result));
      // kill and delete client space if client disconnects with still active websocket in module
      if(!isClientConnected){
        spaces[req.query.id].kill();
        delete spaces[req.query.id];
      }
    })

    // set isClientConnected to false to make sure client space is killed in get function callback if module websocket is still active
    ws.on('close', function close() {
      isClientConnected = false;
    });
  });

  // function to pass request to client space module.
  // cb is used to return data
  function get(data, cb){

    let id = data.id;

    // if client does not have a space yet, create one
    if(!spaces[id]) spaces[id] = fork('./space.js');

    // if the request is not a websocket, then use .once listener.
    // this is also used when data.isWs is not set to ensure no unneeded listeners stay active
    if(!data.isWS){
      spaces[id].once('message', (result) => {
        cb(result);
      });
    }

    // if the called module function creates a websocket, use .on listener to pass multiple messages back
    if(data.isWS){
      spaces[id].on('message', (result) => {
        cb(result);
      });
    }

    // send the request data to the client space
    spaces[id].send(data);
  }

  // return get function to enable direct access in parent
  return {
    get:get
  }
}
