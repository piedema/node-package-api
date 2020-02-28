const config = require('./config');
const npa = require('./node-package-api.js')(config);

npa.add('path', [], (req, status, res) => {
  console.log(req, status, res)
})


npa.get('path', 'dirname', [__dirname], false, (req, status, res) => {
  console.log(req, status, res)
})

setInterval(() => {
  npa.get('path', 'dirname', [__dirname], false, (req, status, res) => {
    console.log(status, res)
  })
}, 1000)

setTimeout(() => {
  npa.destroy((req, status, res) => {
    console.log(req, status, res)
  })
}, 4000);

setTimeout(() => {
  npa.build((req, status, res) => {
    console.log(req, status, res)
  })
}, 9000);

setTimeout(() => {
  npa.add('path', [], (req, status, res) => {
    console.log(req, status, res)
  })
}, 12000)

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
