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

            this.lightStatusBoard.pinMode(this.rgb.r, this.lightStatusBoard.OUTPUT);
            this.lightStatusBoard.pinMode(this.rgb.g, this.lightStatusBoard.OUTPUT);
            this.lightStatusBoard.pinMode(this.rgb.b, this.lightStatusBoard.OUTPUT);

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
        debug('SET', newValue, this.status, this.name);
        if (this.status !== newValue) {
            debug('toggleLight pin: ', this.pin);

            if (singleRelaySwitchMode) {
                this.lightStatusBoard.toggleRelay(this.pin);
            }
            else {
                this.lightStatusBoard.toggleLightRelay(this.pin);
            }
        }
        this.status = newValue;

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
        let rgb = utils.HSBtoRGB([this.hue, this.saturation, this.brightness]);

        debug('setRGB', this.hue, this.saturation, this.brightness, this.name);
        debug('RGB', rgb, this.name);

        rgb = utils.fixRGB(rgb);

        debug('fixed RGB', rgb, this.name);

        this.lightStatusBoard.analogWrite(this.rgb.r, rgb[0]);
        this.lightStatusBoard.analogWrite(this.rgb.g, rgb[1]);
        this.lightStatusBoard.analogWrite(this.rgb.b, rgb[2]);
        callback();
    }

    setStatus(value) {
        // debug('setStatus', THRESHOLD_LIGHT_VALUE < value, this.name);
        return this.status = !!value;
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

        debug('setCurrentStatus', value, this.status, this.name);
        // debug('setCurrentStatus', value, Number(THRESHOLD_LIGHT_VALUE < value));
        if (this.status !== value) {
            this.setStatus(value);
            this._setOnCharacteristic(value);
        }
    }

    setOnCharacteristic(setOnCharacteristic) {
        this._setOnCharacteristic = setOnCharacteristic;
    }
}

module.exports = LightAccessory;
