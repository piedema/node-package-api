const config = require('./config');
const npa = require('./node-package-api.js')(config);

npa.add('path', [], (req, status, res) => {
  console.log(req, status, res)
})




setInterval(() => {
  npa.resetInactivity();

  console.log(npa.isKilled());
}, 1000)



// setTimeout(() => {
// npa.destroy((status) => {
//   console.log('destroy', status)
// })
// }, 5000);
//
// ncas.get({ function:'new_module', module:'path', parameters:[] }, (data) => {
//   //console.log(data)
// })
//
// ncas.get({ function:'new_module', module:'http', parameters:[] }, (data) => {
//   //console.log(data)
// })
//
// ncas.get({ function:'new_module', module:'express', parameters:[] }, (data) => {
//   //console.log(data)
// })
//
//
// ncas.get({ function:'prevDay', module:'node-binance-api', parameters:['ETHBTC', 'callback'] }, (data) => {
//   console.log(data)
// })
//
//
//
// npa.get('node-binance-api', 'websockets.prevDay', ['ETHBTC', 'callback'], false, (req, status, res) => {
//   console.log(res.symbol)
// })
