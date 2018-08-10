"use strict";
const debug = require('debug')('SH:TH');
const boardService = require('../services/board.service');
const config = require('../config/main');

class TemperatureHumidityAccessory {
    constructor(params) {
        this.pin = params.pin;
        this.board = boardService.get(config.thermostatBoard);

        this._readCurrentHumidity();
        setInterval(this._readCurrentHumidity.bind(this), 30000);
    }

    identify(paired, callback) {
        debug('identify', paired);
        callback();
    }

    setTemp(value) {
        // debug('setCurrentStatus', value);
        this.temp = value;
        this.setTempCallback(value);
    }

    getTemp(callback) {
        debug('getTemp', this.pin, this.temp);
        callback(null, this.temp);
    }

    setHum(value) {
        // debug('setCurrentStatus', value);
        this.humidity = value;
        this.setHumCallback(value);
    }

    getHum(callback) {
        debug('getHum', this.pin, this.humidity);
        callback(null, this.humidity);
    }

    setTempCallback(callback) {
        debug('setTempCallback');

        this.setTempCallback = callback;
    }

    setHumCallback(callback) {
        debug('setHumCallback');

        this.setHumCallback = callback;
    }

    _readCurrentHumidity() {
        debug('_readCurrentHumidity', this.pin);
        this.board.readTempHum(this.pin, (value) => {
            debug('board.readTempHum value:', this.pin, '-', value);

            if (!(value instanceof Array)) {
                debug('board.readTempHum value is not array:');
                return;
            }

            this.setHum(parseFloat(value[0]));
            this.setTemp(parseFloat(value[1]));
        });
    }
}

module.exports = TemperatureHumidityAccessory;
