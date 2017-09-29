"use strict";
const debug = require('debug')('LA');
const boardService = require('../services/board.service');
const config = require('../config/main');

const THRESHOLD_LIGHT_VALUE = 400;

class LightAccessory {
    constructor(lightParams) {
        this.pin = lightParams.pin;
        this.apin = lightParams.apin;

        this.lightStatusBoard = boardService.get(config.lightStatusBoard);
    }

    identify(paired, callback) {
        debug('identify', paired);
        callback();
    }

    get(callback) {
        debug('GET', this.apin);
        this.getLightStatus(callback);
    }

    set(newValue, callback) {
        debug('SET', this.pin, newValue);
        if (this.status !== newValue) {
            debug('toggleLight pin: ', this.pin);
            this.lightStatusBoard.toggleLightRelay(this.pin);
        }
        callback();
    }

    setStatus(value) {
        return this.status = Number(THRESHOLD_LIGHT_VALUE < value);
    }

    getLightStatus(callback) {
        debug('getLightStatus', this.status);
        if (this.status !== undefined) {
            return callback(null, this.status);
        }
        this.lightStatusBoard.readLightStatus(this.apin, (value) => {
            debug('getLightStatus - readLightStatus', this.apin, ' - ', value);

            this.lightStatusBoard._registerCallback(this.apin, this.setCurrentStatus.bind(this));
            callback(null, this.setStatus(value));
        });
    }

    setCurrentStatus(value) {
        // debug('setCurrentStatus', value, Number(THRESHOLD_LIGHT_VALUE < value));
        this.currentStatusCallback(this.setStatus(value));
    }

    setCurrentStatusCallback(callback) {
        debug('setCurrentStatusCallback');

        this.currentStatusCallback = callback;
    }
}

module.exports = LightAccessory;
