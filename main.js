"use strict";

var bridgetCore = require('./src/bridgedCore');
var utils = require('./src/utils');
var Arduino = require('node-arduino');
var boardService = require('./src/services/board.service');
var config = require('./src/config/main');

var board = new Arduino.connect(config.mainBoard);

boardService.add(board, config.mainBoard);

board.sp.open(() => {
   setTimeout(() => {
       console.log("Starting HAP...");

       bridgetCore();

       utils.printPincode(config.pincode);
   }, 1000);
});
