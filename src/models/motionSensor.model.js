"use strict";
const debug = require('debug')('SH:MS');
const boardService = require('../services/board.service');
const config = require('../config/main');

class MotionSensorAccessory {
    constructor(motionParams) {
        this.pin = motionParams.pin;
        this.status = false;

        boardService.get(config.thermostatBoard)
            ._registerCallback(this.pin, this.setCurrentStatus.bind(this));
    }

    identify(paired, callback) {
        debug('identify', paired);
        callback();
    }

    get(callback) {
        debug('GET', this.pin);
        callback(this.status);
    }

    set(value, callback) {
        debug('SET', this.pin, value);
        callback();
    }

    setCurrentStatus(value) {
        // debug('setCurrentStatus', value);
        this.currentStatusCallback(value);
    }

    setCurrentStatusCallback(callback) {
        debug('setCurrentStatusCallback');

        this.currentStatusCallback = callback;
    }
}

module.exports = MotionSensorAccessory;
