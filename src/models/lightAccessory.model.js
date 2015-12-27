var _ = require('lodash-node');
var boardservice = require('../services/board.service');
var config = require('../config/main');

function LightAccessory (lightParams) {
    _.extend(this, lightParams);

    this.comp = .5;

    this.board = boardservice.get(config['lightBoard']);

    this.board.pinMode(this.apin, this.board.MODES.ANALOG);
    this.board.pinMode(this.pin, this.board.MODES.OUTPUT);
    this.board.digitalWrite(this.pin, this.board.HIGH);


    this.board.analogReadAverage(this.apin, 100).then(function (value) {
        this.zeroVal = value;
    }.bind(this));

    this.identify = function(paired, callback) {
        console.log('identify', this.id);
        callback();
    }.bind(this);

    this.get = function(callback) {
        var err = null; // in case there were any problems
        console.log('GET ', this.apin);

        this.board.analogReadAverage(this.apin, 10).then(function (value) {
            var val = this.getLightStatus(value);

            console.log('GET analogReadAverage: ', this.apin, val);

            callback(err, val);
        }.bind(this));
    }.bind(this);

    this.getLightStatus = function(value) {
        return Number((this.zeroVal - value) > this.comp);
    }.bind(this);

    this.set = function(newValue, callback) {
        console.log('SET: ', this.pin, newValue);

        this.board.analogReadAverage(this.apin, 10).then(function (value) {
            var val = this.getLightStatus(value);

            console.log('SET analogReadAverage: ', this.apin, val, newValue);

            if (val != newValue) {
                this._toggleLight();
            }
            callback();
        }.bind(this));

    }.bind(this);

    this._toggleLight = function () {
            console.log('toggleLight pin: ', this.pin);

            this.board.digitalWrite(this.pin, this.board.LOW);

            setTimeout(function () {
                this.board.digitalWrite(this.pin, this.board.HIGH);
            }.bind(this), 250);

    }.bind(this);
}

module.exports = LightAccessory;
