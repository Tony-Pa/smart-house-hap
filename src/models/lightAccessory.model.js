"use strict";
const debug = require('debug')('LA');
const boardService = require('../services/board.service');
const config = require('../config/main');

const TOGGLE_LIGHT_TIMEOUT = 250;
const LIGHT_CHECK_INTERVAL = 1000;
const NUMBERS_OF_READS = 10;
const THRESHOLD_LIGHT_VALUE = 200;

class LightAccessory {
    constructor(lightParams) {
        this.pin = lightParams.pin;
        this.apin = lightParams.apin;

        this.board = boardService.get(config.mainBoard);
        this.board.pinModeSetDefault(this.pin, this.board.OUTPUT, this.board.HIGH);

        setTimeout(this._checkTimeout.bind(this), LIGHT_CHECK_INTERVAL * Math.random());
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
        this.getLightStatus((err, value) => {
            if (value !== newValue) {
                this._toggleLight();
            }
            callback();
        });
    }

    getLightStatus(callback) {
        debug('getLightStatus');
        this.board.analogReadAverage(this.apin, NUMBERS_OF_READS, (value) => {
            debug('getLightStatus - analogReadAverage', value);
            callback(null, Number(THRESHOLD_LIGHT_VALUE < value));
        });
    }

    setCurrentStatus(err, value) {
        debug('setCurrentStatus', value);
        this.currentStatusCallback(value);
    }

    setCurrentStatusCallback(callback) {
        this.currentStatusCallback = callback;
    }

    _toggleLight() {
        debug('toggleLight pin: ', this.pin);
        this.board.digitalWrite(this.pin, this.board.LOW);

        setTimeout(() => {
            this.board.digitalWrite(this.pin, this.board.HIGH);
        }, TOGGLE_LIGHT_TIMEOUT);
    }

    _checkTimeout() {
        debug('_checkTimeout');
        setInterval(this._checkInterval.bind(this), LIGHT_CHECK_INTERVAL)
    }

    _checkInterval() {
        debug('_setCheckInterval');
        this.getLightStatus(this.setCurrentStatus.bind(this));
    }
}

module.exports = LightAccessory;
