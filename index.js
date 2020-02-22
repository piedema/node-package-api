const path = require('path');

const config = require(path.resolve(__dirname, 'config.json'));

const ncas = require('./node-crypto-api-server.js')(config);
