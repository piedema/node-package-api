const config = require('./config');
const npa = require('./node-package-api.js')(config);

npa.add('path', [], (req, status, res) => {
    console.log('request:', req);
    console.log('status: ', status);
    console.log('response:', res);
})

setTimeout(() => {
  npa.call('path', 'dirname', [__dirname], false, (req, status, res) => {
      console.log('request:', req);
      console.log('status: ', status);
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
