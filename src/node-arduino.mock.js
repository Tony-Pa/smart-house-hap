"use strict";

class Board {
    constructor() {
        this.sp = {
            open: (callback) => {
                callback()
            }
        };
    }

    pinMode(pin, mode) {
    }

    pinModeSetDefault(pin, mode, defaultVal) {
    }

    digitalRead(pin, callback) {
        setTimeout(callback.bind(null, 1), 500);
    }

    digitalWrite(pin, val) {
    }

    analogReference(type) {
    }

    analogRead(pin, callback) {
        setTimeout(callback.bind(null, 512), 500);
    }

    analogReadAverage(pin, count, callback) {
        setTimeout(callback.bind(null, 512), 500);
    }

    analogWrite(pin, val) {
    }

    readTemp(pin, count, callback) {
        setTimeout(callback.bind(null, [21, 22, 23]), 500);
    }

    readTempHum(pin, callback) {
        setTimeout(callback.bind(null, [20, 24, 26]), 500);
    }

    close() {
    }
}

exports.connect = Board;