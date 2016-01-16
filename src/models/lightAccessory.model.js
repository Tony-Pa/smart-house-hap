"use strict";
var _ = require('lodash-node');
var boardservice = require('../services/board.service');
var config = require('../config/main');
var Arduino = require('node-arduino');

class LightAccessory {
    constructor (lightParams) {
        _.extend(this, lightParams);

        this.sensitivity = .5;

        this.board = boardservice.get(config['lightBoard']);

        this.board.pinMode(this.pin, Arduino.OUTPUT);

        //this.board.digitalWrite(this.pin, this.board.HIGH);
        this.board.analogReadAverage(this.apin, 100).then((value) => {
            this.zeroVal = value;
        });
    }

    identify(paired, callback) {
        console.log('identify', this.id);
        callback();
    }

    get(callback) {
        var err = null; // in case there were any problems

        this.board.analogReadAverage(this.apin, 100).then((value) => {
            var val = this.getLightStatus(value);

            console.log('GET analogReadAverage: ', this.apin, val);

            callback(err, val);
        });
    }

    getLightStatus(value) {
        return Number((this.zeroVal - value) > this.sensitivity);
    }

    set(newValue, callback) {
        console.log('SET: ', this.pin, newValue);

        this.board.analogReadAverage(this.apin, 100).then((value) => {
            var val = this.getLightStatus(value);

            console.log('SET analogReadAverage: ', this.apin, val, newValue);

            if (val != newValue) {
                this._toggleLight();
            }
            callback();
        });
    }

    _toggleLight() {
        console.log('toggleLight pin: ', this.pin);

        this.board.digitalWrite(this.pin, Arduino.LOW);

        setTimeout(() => {
            this.board.digitalWrite(this.pin, Arduino.HIGH);
        }, 250);
    }
}

module.exports = LightAccessory;
