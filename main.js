//var five = require('johnny-five');
var Firmata = require("firmata");

var bridgetCore = require('./src/bridgedCore');
var utils = require('./src/utils');
var boardservice = require('./src/services/board.service');

var config = require('./src/config');

var port = '/dev/ttyACM0';

var board = new Firmata(port);
board.port = port;

//var board = new five.Board({
//    port: port
//});

boardservice.add(board);

board.on('ready', initApp);

function initApp() {
    console.log("Starting HAP...");

    bridgetCore();

    utils.printPincode(config.pincode);
}
