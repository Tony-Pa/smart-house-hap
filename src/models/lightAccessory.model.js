"use strict";
const debug = require('debug')('LA');
const boardService = require('../services/board.service');
const config = require('../config/main');

const TOGGLE_LIGHT_TIMEOUT = 250;
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
        this.getLightStatus((err, value) => {
            if (value !== newValue) {
                this._toggleLight();
            }
            callback();
        });
    }

    getLightStatus(callback) {
        debug('getLightStatus');
        this.lightStatusBoard.readLightStatus(this.apin, (value) => {
            debug('getLightStatus - readLightStatus', this.apin, ' - ', value);

            this.lightStatusBoard._registerCallback(this.apin, this.setCurrentStatus.bind(this));
            callback(null, Number(THRESHOLD_LIGHT_VALUE < value));
        });
    }

    setCurrentStatus(value) {
        // debug('setCurrentStatus', value, Number(THRESHOLD_LIGHT_VALUE < value));
        this.currentStatusCallback(Number(THRESHOLD_LIGHT_VALUE < value));
    }

    setCurrentStatusCallback(callback) {
        debug('setCurrentStatusCallback');

        this.currentStatusCallback = callback;
    }

    _toggleLight() {
        debug('toggleLight pin: ', this.pin);
        this.lightStatusBoard.setLightRelay(this.pin, this.lightStatusBoard.LOW);

        setTimeout(() => {
            this.lightStatusBoard.setLightRelay(this.pin, this.lightStatusBoard.HIGH);
        }, TOGGLE_LIGHT_TIMEOUT);
    }
}

module.exports = LightAccessory;
