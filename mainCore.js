"use strict";

const core = require('./src/Core');
const utils = require('./src/utils');
const boardService = require('./src/services/board.service');
const config = require('./src/config/main');

const automationService = require('./src/services/automation.service');

const local = false;
const Arduino = local
    ? require('./src/node-arduino.mock.js')
    : require('node-arduino');

// const mainBoard = new Arduino.connect(config.mainBoard);
const lightStatusBoard = new Arduino.connect(config.lightStatusBoard);
const thermostatBoard = new Arduino.connect(config.thermostatBoard);

// boardService.add(mainBoard, config.mainBoard);
boardService.add(lightStatusBoard, config.lightStatusBoard);
boardService.add(thermostatBoard, config.thermostatBoard);

boardService.openAll(() => {
    setTimeout(() => {
        console.log("Starting HAP...");

        core();

        automationService.startAll();

        let timeoutId = {};
        setInterval(() => {
            Object.keys(boardService.list).forEach((key) => {
                // console.log('healthCheck', key);
                boardService.healthCheck(key,  () => {
                    // console.log('recieved HC',key);
                    clearTimeout(timeoutId[key]);
                    timeoutId[key] = setTimeout(() => {throw(new Error('healthCheck fails'))}, 10000);
                });
            });
        }, 2000);

        utils.printPincode(config.pincode);
    }, 1000);
});
