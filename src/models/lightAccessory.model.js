"use strict";
const debug = require('debug')('SH:LA');
const boardService = require('../services/board.service');
const config = require('../config/main');
const utils = require('../utils');

// const THRESHOLD_LIGHT_VALUE = 400;
const singleRelaySwitchMode = true;

class LightAccessory {
    constructor(lightParams) {
        this.pin = lightParams.pin;
        this.apin = lightParams.apin;
        this.name = lightParams.serviceName;
        this.rgb = lightParams.rgb;

        this.lightStatusBoard = boardService.get(config.lightStatusBoard);

        if (this.rgb) {
            this.hue = 0;
            this.saturation = 0;
            this.brightness = 0;
            //     this.rgbBoard = boardService.get(config.rgbBoard);
        }

        this.status = false;
        this.lightStatusBoard._registerCallback(this.apin, this.setCurrentStatus.bind(this));
    }

    identify(paired, callback) {
        debug('identify', paired, this.name);
        callback();
    }

    get(callback) {
        debug('GET', this.apin, this.status, this.name);
        callback(null, this.status);
        // this.getLightStatus(callback);
    }

    set(newValue, callback) {
        debug('SET', this.pin, newValue, this.status);
        if (this.status !== newValue) {
            debug('toggleLight pin: ', this.pin);

            if (singleRelaySwitchMode) {
                this.lightStatusBoard.toggleRelay(this.pin);
            }
            else {
                this.lightStatusBoard.toggleLightRelay(this.pin);
            }
        }
        callback();
    }

    setBrightness(value, callback) {
        this.brightness = value;
        this.setRGB(callback);
    }

    setSaturation(value, callback) {
        this.saturation = value;
        this.setRGB(callback);
    }

    setHue(value, callback) {
        this.hue = value;
        this.setRGB(callback);
    }

    setRGB(callback) {
        debug('setRGB', this.hue, this.saturation, this.brightness, this.name);

        const rgb = utils.HSVtoRGB(this.hue, this.saturation, this.brightness);

        this.lightStatusBoard.analogWrite(this.rgb.r, rgb.r);
        this.lightStatusBoard.analogWrite(this.rgb.g, rgb.g);
        this.lightStatusBoard.analogWrite(this.rgb.b, rgb.b);
        callback();
    }

    setStatus(value) {
        // debug('setStatus', THRESHOLD_LIGHT_VALUE < value, this.name);
        return this.status = !!value;
        // return this.status = THRESHOLD_LIGHT_VALUE < value;
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
