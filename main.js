"use strict";

const bridgetCore = require('./src/bridgedCore');
const utils = require('./src/utils');
const boardService = require('./src/services/board.service');
const config = require('./src/config/main');

const local = !false;
const Arduino = local
    ? require('./src/node-arduino.mock.js')
    : require('node-arduino');

const board = new Arduino.connect(config.mainBoard);

boardService.add(board, config.mainBoard);

board.sp.open(() => {
    setTimeout(() => {
        console.log("Starting HAP...");

        bridgetCore();

        utils.printPincode(config.pincode);
    }, 1000);
});
