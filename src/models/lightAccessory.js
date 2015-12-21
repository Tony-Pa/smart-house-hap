var _ = require('lodash-node');

function LightAccessory (lightParams) {
    _.extend(this, lightParams);

    this.identify = function(paired, callback) {
        console.log('identify', this.id);
        callback();
    }.bind(this);

    this.get = function(callback) {
        var err = null; // in case there were any problems

        if (this.powerOn) {
            console.log("Are we on? Yes.");
            callback(err, true);
        }
        else {
            console.log("Are we on? No.");
            callback(err, false);
        }
    }.bind(this);

    this.set = function(value, callback) {
        console.log('writing to pin: ', this.pin);
        this.powerOn = value;
        callback();
    }.bind(this)
}

module.exports = LightAccessory;
