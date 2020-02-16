const ipc = require('node-ipc');

ipc.config.silent = true;
ipc.connectTo('node-crypto-api-server');

// let id1 = 'test1'
// ipc.of['node-crypto-api-server'].emit('#', { id:id1, module:'binance', function:'websockets.prevDay', parameters:[ 'ETHBTC' ] });
// ipc.of['node-crypto-api-server'].on('#' + id1, (data) => {
//   console.log('ipc: ', data);
// })
//
// let id2 = 'test2'
// ipc.of['node-crypto-api-server'].emit('#', { id:id2, module:'coinmarketcap', function:'get', parameters:[ 'coinmarketcap-test' ] });
// ipc.of['node-crypto-api-server'].once('#' + id2, (data) => {
//   console.log('ipc: ', data);
// })

// const got = require('got');
//
// (async () => {
//     try {
//         const response = await got('http://localhost:8080/_?module=binance&function=prevDay&parameters=ETHBTC');
//         console.log('express: ', response.body);
//     } catch (error) {
//         console.log(error);
//     }
// })();
//
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
});

client.connect('ws://localhost:8080/_?module=binance&function=websockets.miniTicker');
