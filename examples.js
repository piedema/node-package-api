const config = require('./config');
const npa = require('./node-package-api.js')(config);

npa.add('path', [], (req, success, res) => {
    console.log('request:', req);
    console.log('status: ', success);
    console.log('response:', res);
})

setTimeout(() => {
  npa.call('path', 'dirname', [__dirname], false, (req, success, res) => {
      console.log('request:', req);
      console.log('status: ', success);
      console.log('response:', res);
  });
}, 1000);

setTimeout(() => {
  let destroy = npa.destroy();
  console.log(destroy);
}, 2000);

setTimeout(() => {
  let build = npa.build();
  console.log(build);
}, 3000);

setTimeout(() => {
  let isKilled = npa.isKilled();
  console.log(isKilled);
}, 4000);

setTimeout(() => {
  let resetInactivity = npa.resetInactivity();
  console.log(resetInactivity);
}, 5000);



npa.add('node-binance-api', [], (req, success, res) => {
    console.log('request:', req);
    console.log('success: ', success);
    console.log('response:', res);
})

setTimeout(() => {
  npa.call('node-binance-api', 'prices', ['ETHBTC', 'cb:2'], false, (req, success, res) => {
      console.log('request:', req);
      console.log('success: ', success);
      console.log('response:', res);
  });
}, 1000);
