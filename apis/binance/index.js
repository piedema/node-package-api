const Binance = require('node-binance-api');
const config = require('./config.json');
let options = config;
let package = new Binance().options(options);

module.exports = (function(){

  return package;

})();
