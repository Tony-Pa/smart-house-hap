"use strict";
var debug = require('debug');
var boardService = require('../services/board.service');
var config = require('../config/main');

class ThermostatAccessory {
    constructor (thermostatParams) {
        this.OFF_INTERVAL = 60000; // 10 min
        this.ON_INTERVAL = 6000; // 1 min
        this.TEMP_DELTA = 1;
        this.currentTemp = 0;
        this.relayStatus = false;
        this.pins = thermostatParams.pins;
        this.tempSensors = thermostatParams.tempSensors;

        this.board = boardService.get(config.mainBoard);

        this.board.pinModeSetDefault(this.pins.relay, this.board.OUTPUT, this.board.HIGH);

        this.setState(0);
        // this.debug = debug('TSA');
    }

    identify(paired, callback) {
        console.log('identify', this.id, paired);
        callback();
    }

    getState(callback) {
        callback(null, this.state);
    }

    setState(value, callback) {
        this.state = value;

        this._processStateUpdate();

        callback && callback();
    }

    getTemp(callback) {
        callback(null, this.temp);
    }

    setTemp(value, callback) {
        this.temp = value;
        this._processRelayStatus();
        callback();
    }

    getCurrentTemp(callback) {
        if (!this.currentTemp) {
            this._readCurrentTemp(callback);
            return;
        }
        callback(null, this.currentTemp);
    }

    _readCurrentTemp(callback) {
        this.board.readTemp(this.pins.temp, this.tempSensors, (value) => {
            let sum = 0;
            value.forEach((elem) => sum += parseFloat(elem, 10));

            this.currentTemp = Math.round(sum/value.length);

            this._processRelayStatus();
            callback && callback(null, this.currentTemp);
        });
    }

    _turnRelay(on) {
        if (this.relayStatus !== on ) {
            this.relayStatus = on;
            this.board.digitalWrite(this.pins.relay, on ? this.board.LOW : this.board.HIGH);
        }
    }

    _processStateUpdate() {
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
        clearInterval(this.intervalId);
        this.intervalId = setInterval(this._readCurrentTemp.bind(this), time)
    }
}

module.exports = ThermostatAccessory;
