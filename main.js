"use strict";

const local = !false;

const bridgetCore = require('./src/bridgedCore');
const utils = require('./src/utils');

const Arduino = !local ? require('node-arduino') : require('./src/node-arduino.mock.js');

const boardService = require('./src/services/board.service');
const config = require('./src/config/main');

const board = new Arduino.connect(config.mainBoard);

boardService.add(board, config.mainBoard);

board.sp.open(() => {
    setTimeout(() => {
        console.log("Starting HAP...");

        bridgetCore();

        utils.printPincode(config.pincode);
    }, 1000);
});
