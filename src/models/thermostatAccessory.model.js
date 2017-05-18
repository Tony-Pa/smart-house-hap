"use strict";
var debug = require('debug')('TSA');
var boardService = require('../services/board.service');
var config = require('../config/main');
var storage = require('node-persist');

class ThermostatAccessory {
    constructor(thermostatParams) {
        this.OFF_INTERVAL = 600000; // 10 min
        this.ON_INTERVAL = 60000; // 1 min
        this.TEMP_DELTA = 1;
        this.currentTemp = 0;
        this.relayStatus = false;
        this.id = thermostatParams.id;
        this.pins = thermostatParams.pins;
        this.tempSensors = thermostatParams.tempSensors;

        this.board = boardService.get(config.mainBoard);
        this.board.pinModeSetDefault(this.pins.relay, this.board.OUTPUT, this.board.HIGH);

        this.storageGet('temp', (err, value) => {
            this.temp = value || 24;
        });
        this.storageGet('state', (err, value) => {
            this.state = value || 0;
            this._processStateUpdate();
        });
    }

    identify(paired, callback) {
        debug('identify', this.id, paired);
        callback();
    }

    getState(callback) {
        debug('getState');
        this.storageGet('state', callback);
    }

    setState(value, callback) {
        debug('setState', value);
        this.state = value;
        this.storageSet('state', value);

        this._processStateUpdate();

        callback && callback();
    }

    getTemp(callback) {
        debug('getTemp');
        this.storageGet('temp', callback);
    }

    setTemp(value, callback) {
        debug('setTemp', value);

        this.temp = value;
        this.storageSet('temp', value);

        this._processRelayStatus();
        callback();
    }

    getCurrentTemp(callback) {
        debug('getCurrentTemp', this.currentTemp);

        if (!this.currentTemp) {
            this._readCurrentTemp(callback);
            return;
        }
        callback(null, this.currentTemp);
    }

    setCurrentTemp(value) {
        debug('setCurrentTemp');
        this.currentTempCallback(value);
    }

    setCurrentTempCallback(callback) {
        this.currentTempCallback = callback;
    }

    _readCurrentTemp(callback) {
        debug('_readCurrentTemp');
        this.board.readTemp(this.pins.temp, this.tempSensors, (value) => {

            let sum = 0;
            value.forEach((elem) => sum += parseFloat(elem, 10));

            this.currentTemp = Math.round(sum / value.length);

            this.setCurrentTemp(this.currentTemp);

            this._processRelayStatus();
            debug('board.readTemp', this.currentTemp);

            callback && callback(null, this.currentTemp);
        });
    }

    _turnRelay(status) {
        debug('_turnRelay', status);

        if (this.relayStatus !== status) {
            this.relayStatus = status;
            this.board.digitalWrite(this.pins.relay, status ? this.board.LOW : this.board.HIGH);
        }
    }

    _processStateUpdate() {
        debug('_processStateUpdate');

        var tempInterval;
        if (!this.state) {
            this._turnRelay(false);
            tempInterval = this.OFF_INTERVAL;
        }
        else {
            this._readCurrentTemp();
            tempInterval = this.ON_INTERVAL;
        }
        this._setNewTempInterval(tempInterval);
    }

    _processRelayStatus() {
        debug('_processRelayStatus');

        if (this.state) {
            if (this.currentTemp >= this.temp + this.TEMP_DELTA) {
                this._turnRelay(false);
            }
            if (this.currentTemp <= this.temp - this.TEMP_DELTA) {
                this._turnRelay(true);
            }
        }
    }

    _setNewTempInterval(time) {
        debug('_setNewTempInterval', time);

        clearInterval(this.intervalId);
        this.intervalId = setInterval(this._readCurrentTemp.bind(this), time)
    }

    storageSet(key, value) {
        storage.setItem('thermostat:' + this.id + ':' + key, value);
    }

    storageGet(key, callback) {
        storage.getItem('thermostat:' + this.id + ':' + key, callback);
    }
}

module.exports = ThermostatAccessory;
