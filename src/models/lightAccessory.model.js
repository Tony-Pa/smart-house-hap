"use strict";
var debug = require('debug');
var boardService = require('../services/board.service');
var config = require('../config/main');

const TOGGLE_LIGHT_TIMEOUT = 250;

class LightAccessory {
    constructor(lightParams) {
        this.pin = lightParams.pin;
        this.apin = lightParams.apin;
        this.zeroVal = 200;

        this.board = boardService.get(config.mainBoard);

        this.board.pinModeSetDefault(this.pin, this.board.OUTPUT, this.board.HIGH);

        this._toggleLight();
        // this.debug = debug('LA');
    }

    identify(paired, callback) {
        console.log('identify', this.id, paired);
        callback();
    }

    get(callback) {
        var err = null; // in case there were any problems
        console.log('GET', this.apin);
        this.getLightStatus().then((val) => {
            console.log('GET analogReadAverage: ', this.apin, val);

            callback(err, val);
        });
    }

    getLightStatus() {
        console.log('getLightStatus');
        return new Promise((resolve) => {

            console.log('getLightStatus - Promise');
            this.board.analogReadAverage(this.apin, 10, (value) => {

                console.log('getLightStatus - Promise - resolve', value);
                resolve(Number(this.zeroVal < value));
            });
        });
    }

    set(newValue, callback) {
        console.log('SET: ', this.pin, newValue);
        this.getLightStatus().then((val) => {

            console.log('SET analogReadAverage: ', this.apin, val, newValue);

            if (val !== newValue) {
                this._toggleLight();
            }
            callback();
        });
    }

    _toggleLight() {
        console.log('toggleLight pin: ', this.pin);

        this.board.digitalWrite(this.pin, this.board.LOW);

        setTimeout(() => {
            this.board.digitalWrite(this.pin, this.board.HIGH);
        }, TOGGLE_LIGHT_TIMEOUT);
    }
}

module.exports = LightAccessory;
