const Binance = require('node-binance-api');
const config = require('./config.json');
let options = config || {};
let binance = new Binance(options);

module.exports = (function(){

  return binance;

})();

module.exports.terminate = function(id){

  binance.websockets.terminate(id);

}
