const fetch = require('node-fetch');                                                            // require fetch for packages using promises
const path = require('path');
const fs = require('fs');

const packages = {};                                                                            // will hold all loaded packages

const ERROR = {
  PACKAGE_NOT_FOUND:'Package is not found',
  PACKAGE_NOT_LOADED:'Package is not loaded, please add package first',
  PACKAGE_ALLREADY_LOADED:'Package is allready loaded',
  FUNCTION_NOT_FOUND:'Function is not found on package',
  NO_CB:'No callback function specified',
  PARAMETERS_IS_NOT_ARRAY:'Parameters is not array'
}

/**
* listener listening for messages(requests) from parent process
* (data.type === add) add new package to space
* (data.type === call) call function in package
*/
process.on('message', (data) => {
  if(data.type === 'add') addPackage(data, (req, status = false, res = null) => { process.send({req:req, status:status, res:res}) });
  if(data.type === 'call') call(data, (req, status = false, res = null) => { process.send({req:req, status:status, res:res}) });
});

/**
* checks if a package is installed in any of the provided spaces
* @param {array} paths - Name of package (node_module)
* @param {string} parameters - parameters needed if package returns function
* @return {boolean} returns true if a package with package name is found in provided path(s)
*/
function isPackageInstalled(paths, package){
  let separator = path.sep;                                                                     // separator used depending on OS
  paths.forEach((path) => {
    if(fs.existsSync(path + separator + package)){
    }
  })
  return true;                                                                                  // package is found
}

/**
* add package to space
* @param {object} req - request data recieved from parent process
* @param {function} cb - callback function to send data back to parent process
* @return {function} {packages[package]} - package is allready loaded. returns request data, false and error to parent process
* @return {function} {!isPackageInstalled} - package is not found. returns request data, false and error to parent process
*/
function addPackage(req, cb){
  let package = req.package;                                                                    // package name to load
  if(packages[package]) return cb(req, false, ERROR.PACKAGE_ALLREADY_LOADED);                   // check if package is allready loaded
  let paths = req.paths;
  if(!isPackageInstalled(paths, package)) return cb(req, false, ERROR.PACKAGE_NOT_FOUND);       // check if package is installed
  let pack = require(package);                                                                  // require package
  let parameters = req.parameters;                                                              // set parameters for instantiation
  if(typeof pack === 'function') packages[package] = new pack(...parameters);                   // instantiate if packages is function
  if(typeof pack === 'object') packages[package] = pack;                                        // store package in packages
  cb(req, true, 'Package is added to space');                                                   // callback true because package is laoded
}

/**
* call function in package
* @param {object} req - request data recieved from parent process
* @param {function} cb - callback function to send data back to parent process
* @return {function} {!packages[package]} - package is not added. returns request data, false and error to parent process
* @return {function} {!target} - function is not found on specified package. returns request data, false and error to parent process
*/
function call(req, cb){
  let package = req.package;                                                                    // package name
  if(!packages[package]) return cb(req, false, ERROR.PACKAGE_NOT_LOADED);                       // return callback error if package does not exist

  let func = req.function.split('.');                                                           // turn nested function string into array
  let target = packages[package];                                                               // start target path query with package
  func.forEach((key) => {                                                                       // itterate function array to build path to function
    target = target[key];
  });

  if(!target) return cb(req, false, ERROR.FUNCTION_NOT_FOUND);                                  // if target function does not exist return error

  let parameters = Array.isArray(req.parameters) ? req.parameters : [];
  for(let i = 0; i < parameters.length; i++){                                                   //  replace all 'callback' values with actual callbacks
    if(parameters[i].startsWith('cb')){
      let nParams = parseFloat(parameters[i].split(':')[1])
      let params = Array.apply(null, Array(nParams)).map(                                       // create new array with the length specified as parameters[i] by providing
        (x, i) => { return '_' + i; }                                                           // cb:1 or higher number in the call function. the number indicates the amount
      )                                                                                         // of parameters the target function returns
      parameters[i] = (...res) => {
        cb(req, true, res);                                                               // the returned status 'true' indicates that the function was executed
      }                                                                                         // the function itself might return an error while status = true
    }
  }

  let isPromise = req.isPromise;
  if(isPromise){                                                                                // if target function = promise, req.promise should be true and a promise is returned
      return target(...parameters)
        .then(function(data){
          cb(req, true, data);
        })
        .catch(function(error){
          cb(req, true, error);
        })
  }

  if(!isPromise) target(...parameters)                                                          // if target function != promise, call target function
}
