var bridgetCore = require('./src/bridgedCore');
var utils = require('./src/utils');
var BoardModel = require('./src/models/board.model');
var boardService = require('./src/services/board.service');

var config = require('./src/config/main');

//*
//var Firmata = require("firmata");
var board = new BoardModel(config.lightBoard);
//board.port = config.board;
/*/
var five = require('johnny-five');
var board = new five.Board({
    port: config.board
});
//*///
boardService.add(board);

board.on('ready', initApp);

function initApp() {
    console.log("Starting HAP...");

    bridgetCore();

    utils.printPincode(config.pincode);
}
