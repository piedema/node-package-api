const ipc = require('node-ipc');

const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

const apis = require('./apis/list.json');
const modules = {};

module.exports = function(config){

  // LOADING MODULES
  apis.list.forEach((name) => {

    modules[name] = require(`./apis/${name}/index.js`)

  })

  // IPC SERVER
  for(let key in config.ipc) ipc.config[key] = config.ipc[key];

  ipc.serve(
    () => {
      ipc.server.on('#', (data, socket) => {

        let id = '#' + data.id;
        let mod = data.module;
        let func = data.function.split('.');
        let params = data.parameters || [];

        let target = modules[mod];
        func.forEach((key) => {
          target = target[key];
        });

        params.push((error, response) => {
          ipc.server.emit(socket, id, error || response);
        })

        if(!modules[mod]) return params[params.length-1](`Module "${mod}" does not exist.`);
        if(!target) return params[params.length-1](`Module "${mod}" does not have function "${func}".`);

        target(...params);
      })
    }
  )

  ipc.server.start();

  // EXPRESS SERVER
  app.get('/_', (req, res) => {

    let mod = req.query.module;
    let func = req.query.function.split('.');
    let params = req.query.parameters ? req.query.parameters.split(',') : [];

    let target = modules[mod];
    func.forEach((key) => {
      target = target[key];
    });

    params.push((error, response) => {
      res.send(error || response);
    })

    if(!modules[mod]) return params[params.length-1](`Module "${mod}" does not exist.`);
    if(!target) return params[params.length-1](`Module "${mod}" does not have function "${func}".`);

    target(...params);

  })

  app.ws('/_', function(ws, req) {

    let mod = req.query.module;
    let func = req.query.function.split('.');
    let params = req.query.parameters ? req.query.parameters.split(',') : [];

    let target = modules[mod];
    func.forEach((key) => {
      target = target[key];
    });

    params.push((error, response) => {
      let resp = JSON.stringify(error || response)
      ws.send(resp);
    })

    if(!modules[mod]) return params[params.length-1](`Module "${mod}" does not exist.`);
    if(!target) return params[params.length-1](`Module "${mod}" does not have function "${func}".`);

    let openedWs = target(...params);
    console.log(openedWs);

    ws.on('close', function close() {
      console.log('disconnected');
      modules[mod].terminate(openedWs);
    });

  });

  app.listen(config.express.port);
}
