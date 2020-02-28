// require fetch for packages using promises
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

// packages holds all loaded packages
const packages = {};

// standard error messages
const ERROR = {
  PACKAGE_NOT_FOUND:'Package is not found',
  PACKAGE_ALLREADY_LOADED:'Package is loaded',
  FUNCTION_NOT_FOUND:'Function is not found on package',
  NO_CB:'No callback function specified',
  PARAMETERS_IS_NOT_ARRAY:'Parameters is not array'
}

// listener to listen for requests coming from node-package-api parent process
process.on('message', (data) => {
  // on type = new create new packages
  if(data.type === 'new') newPackage(data, (req, status = false, res = null) => { process.send({req:req, status:status, res:res}) });
  // on type = get execture function on given package
  if(data.type === 'get') run(data, (req, status = false, res = null) => { process.send({req:req, status:status, res:res}) });
});

// check if package is installed on system in node_modules folder in all given paths
// to make sure a not-installed package is not required and prevent error
function isPackageInstalled(paths, mod){
  // separator used depending on OS
  let separator = path.sep;
  // boolean if package is found
  let isFound = false;
  // itterate paths, if p-ackage is found anywhere in given paths, isFound = true and package is isntalled
  paths.forEach((path) => {
    if(fs.existsSync(path + separator + mod )){
      isFound = true;
    }
  })
  // return isFound to caller
  return isFound;
}

// load new package for later use in requests
function newPackage(req, cb){
  // package name to load
  let package = req.package;
  // check if package is allready loaded
  if(packages[package]) return cb(req, false, ERROR.PACKAGE_ALLREADY_LOADED);
  // check if package is installed in system, return if it isnt
  let paths = req.paths;
  if(!isPackageInstalled(paths, package)) return cb(req, false, ERROR.PACKAGE_NOT_FOUND);
  // require package
  let pack = require(package);
  // set parameters for instantiation
  let parameters = req.parameters;
  // check if package is function. if so, then instantiate with optional parameters and store in packages object
  if(typeof pack === 'function') packages[package] = new pack(...parameters);
  // store package in packages
  if(typeof pack === 'object') packages[package] = pack;
  // package is loaded, so return true to caller
  cb(req, true);
}

// execute function in package on request
function run(req, cb){
  // return callback error if package does not exist
  let package = req.package;
  if(!packages[package]) return cb(req, false, ERROR.PACKAGE_NOT_FOUND);

  // build path to function
  let func = req.function.split('.');
  let target = packages[package];
  func.forEach((key) => {
    target = target[key];
  });
  // if target is false then provided "func/req.function" path is false, return callback error
  if(!target) return cb(req, false, ERROR.FUNCTION_NOT_FOUND);

  // prepare parameters, if req.parameters != array then set empty array
  let parameters = Array.isArray(req.parameters) ? req.parameters : [];
  // replace all 'callback' strings in parameters array with actual callback function
  for(let i = 0; i < parameters.length; i++){
    if(parameters[i] === 'callback'){
      parameters[i] = (error, response) => {
        // the return true value is true for being able to execute function on package and return a value.
        // it doenst indicate that the actual function didnt return an error
        cb(req, true, error || response);
      }
    }
  }

  // logic for using promises or not
  let isPromise = req.isPromise;
  if(isPromise){
      return target(...parameters)
        .then(function(data){
          cb(req, true, data);
        })
        .catch(function(error){
          // the return true value is true for being able to execute function on package and return a value.
          // it doenst indicate that the actual function didnt return an error
          cb(req, true, error);
        })
  }

  // call target function for callback and return types. return data to be send to client
  if(!isPromise) cb(req, true, target(...parameters));
}
