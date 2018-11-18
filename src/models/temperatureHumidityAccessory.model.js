"use strict";
const Sequelize = require('sequelize');
const debug = require('debug')('SH:TH');
const boardService = require('../services/board.service');
const config = require('../config/main');

const sequelize = new Sequelize(config.db);

class TemperatureHumidityAccessory {
    static getDB() {
        return this.db;
    }

    static initDB() {
        this.db = sequelize.define('tempAndHum', {
            deviceId: Sequelize.STRING,
            temp: Sequelize.FLOAT,
            hum: Sequelize.FLOAT,
        });

        this.db.sync();
    }

    constructor(params) {
        this.deviceId = params.id;
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
            const [temp, hum] = value;
            const deviceId = this.deviceId;

            this.setHum(parseFloat(temp));
            this.setTemp(parseFloat(hum));

            TemperatureHumidityAccessory.getDB().create({ deviceId, temp, hum });
        });
    }
}

module.exports = TemperatureHumidityAccessory;
