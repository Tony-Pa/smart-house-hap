"use strict";
const debug = require('debug')('SH:TSA');
const Characteristic = require('hap-nodejs').Characteristic;

const boardService = require('../services/board.service');
const config = require('../config/main');
const accessoriesService = require('../services/accessories.service');
// const storage = require('node-persist');

class ThermostatAccessory {
    constructor(thermostatParams) {
        this.OFF_INTERVAL = 600000; // 10 min
        this.ON_INTERVAL = 60000; // 1 min
        this.TEMP_DELTA = 1;
        this.HUM_DELTA = 5;
        this.currentTemp = 0;
        this.relayStatus = false;
        this.id = thermostatParams.id;
        this.pins = thermostatParams.pins;
        this.tempHum = thermostatParams.tempHum;
        this.fan = thermostatParams.fan;
        this.tempSensors = thermostatParams.tempSensors;
        this.fanTurnedOnProgramaticaly = false;

        this.board = boardService.get(config.thermostatBoard);
        this.board.pinModeSetDefault(this.pins.relay, this.board.OUTPUT, this.board.HIGH);

        this.storageGet('temp', (err, value) => {
            this.temp = value || 24;
        });
        this.storageGet('hum', (err, value) => {
            this.humidity = value || 30;
        });
        this.storageGet('state', (err, value) => {
            this.state = value || 0;
            this._processStateUpdate();
        });

        if (this.tempHum) {
            setTimeout(() => this._readCurrentHumidity(), 1000);
            setInterval(this._readCurrentHumidity.bind(this), 30000);
        }
    }

    identify(paired, callback) {
        debug('identify', this.id, paired);
        callback();
    }

    getBoard() {
        return boardService.get(config.lightStatusBoard);
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

    getHumidity(callback) {
        let hum = 0;
        this.storageGet('hum', (humidity) => hum = humidity);

        debug('getHumidity', hum);
        this.storageGet('hum', callback);
    }

    setHumidity(value, callback) {
        debug('setHumidity', value);

        this.humidity = value;
        this.storageSet('hum', value);

        this._processFanStatus();
        callback();
    }

    getCurrentHumidity(callback) {
        debug('getCurrentHumidity', this.currentHumidity);

        if (!this.currentHumidity) {
            this._readCurrentHumidity(callback);
            return;
        }
        callback(null, this.currentHumidity);
    }

    setCurrentHumidity(value) {
        debug('setCurrentHumidity');
        this.currentHumidityCallback(value);
    }

    setCurrentHumidityCallback(callback) {
        this.currentHumidityCallback = callback;
    }

    _readCurrentTemp(callback) {
        debug('_readCurrentTemp', this.pins.temp);
        this.board.readTemp(this.pins.temp, this.tempSensors, (value) => {
            debug('board.readTemp value:', this.pins.temp, '-', value);

            if (!(value instanceof Array)) {
              debug('board.readTemp value is not array:');
              callback && callback(null, 0);
              return;
            }

            let sum = 0;
            value.forEach((elem) => sum += parseFloat(elem));

            this.currentTemp = Math.round(sum / value.length);

            if (this.currentTemp === -127) {
              return callback && callback('wrong temp');
            }

            this.setCurrentTemp(this.currentTemp);

            this._processRelayStatus();
            debug('board.readTemp', this.currentTemp);

            callback && callback(null, this.currentTemp);
        });
    }

    _readCurrentHumidity(callback) {
        debug('_readCurrentHumidity', this.tempHum);
        this.board.readTempHum(this.tempHum, (value) => {
            debug('board.readTempHum value:', this.tempHum, '-', value);

            if (!(value instanceof Array)) {
                debug('board.readTempHum value is not array:');
                return;
            }
            const [hum, temp] = value;
            this.currentHumidity = hum;
            this.setCurrentHumidity(parseFloat(hum));
            this._processFanStatus();
            callback && callback(null, hum);
        });
    }

    _turnRelay(status) {
        debug('_turnRelay', status);

        if (this.relayStatus !== status) {
            this.relayStatus = status;
            this.board.digitalWrite(this.pins.relay, status ? this.board.LOW : this.board.HIGH);
        }
    }

    _turnFan(status) {
        this.fanTurnedOnProgramaticaly = status;

        accessoriesService.get(this.fan)
            .setCharacteristic(Characteristic.On, status);
    }

    _processStateUpdate() {
        debug('_processStateUpdate');

        if (!this.state) {
            this._turnRelay(false);
            this._setNewTempInterval(this.OFF_INTERVAL);
        }
        else {
            this._readCurrentTemp();
            this._setNewTempInterval(this.ON_INTERVAL);
        }
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

    _processFanStatus() {
        debug('_processFanStatus', this.currentHumidity, this.humidity);
        if (this.currentHumidity >= this.humidity + this.HUM_DELTA) {
            this._turnFan(true);
        }
        if (this.fanTurnedOnProgramaticaly && (this.currentHumidity <= this.humidity - this.HUM_DELTA)) {
            this._turnFan(false);
        }
    }

    _setNewTempInterval(time) {
        debug('_setNewTempInterval', time);

        clearInterval(this.tempIntervalId);
        this.tempIntervalId = setInterval(this._readCurrentTemp.bind(this), time);
    }

    storageSet(key, value) {
        // storage.setItem('thermostat:' + this.id + ':' + key, value);
        this['thermostat:' + this.id + ':' + key] = value;
    }

    storageGet(key, callback) {
        // storage.getItem('thermostat:' + this.id + ':' + key, callback);
        callback(this['thermostat:' + this.id + ':' + key])
    }
}

module.exports = ThermostatAccessory;
