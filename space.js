
// require fetch for packages using promises
const fetch = require('node-fetch');

const fs = require('fs');

const modules = {};

const lifespans = {};

// listener to listen request coming from creater
process.on('message', (data) => {

  if(!fs.existsSync(`./apis/${data.module}`)) return console.log(`A module with name ${data.module} does not exist.`);
  if(!modules[data.module]) modules[data.module] = require(`./apis/${data.module}/index.js`);

  //console.log(process.send(modules[data.module]))

  run(data, (response) => {
    process.send(response);
  });

});

function run(data, cb){
  // configure parameters
  let id = data.id;
  let mod = data.module;
  let func = data.function.split('.');
  let params = data.parameters || [];
  if(typeof params === 'string') params = params.split(',');
  let isPromise = data.isPromise;

  // build path to function
  let target = modules[mod];
  func.forEach((key) => {
    target = target[key];
  });

  //check if function exists on path to avoid errors
  if(!target) return console.log(`${mod}.${func.join('.')}() does not exist.`)

  //replace all items named callback in params array with callback function
  for(let i = 0; i < params.length; i++){
    if(params[i] === 'callback'){
      params[i] = (error, response) => {
        cb(error || response);
      }
    }
  }

  // logic for using promises
  if(isPromise){
      return target(...params);
        .then(function(data){
          cb(data);
        })
        .catch(function(error){
          cb(error);
        })
  }

  // call target function for callback and return types. return data to be send to client
  if(!isPromise) return target(...params);
}
