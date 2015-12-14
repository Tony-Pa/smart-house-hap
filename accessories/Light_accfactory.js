var Accessory = require('hap-nodejs').Accessory;
var Service = require('hap-nodejs').Service;
var Characteristic = require('hap-nodejs').Characteristic;
var uuid = require('hap-nodejs').uuid;

var lightConfig = require('./light_config.json');

// here's a fake hardware device that we'll expose to HomeKit
var FAKE_LIGHT = {
  powerOn: false,

  setPowerOn: function(on) {
    console.log("Turning the light %s!", on ? "on" : "off");
    FAKE_LIGHT.powerOn = on;
  },
  identify: function() {
    console.log("Identify the light!");
  }
};

var lights = [];

lightConfig.forEach(function (lightParams) {

    var lightUUID = uuid.generate('hap-nodejs:accessories:light:' + lightParams.id);
    var light = new Accessory(lightParams.name, lightUUID);

    light.pin = lightParams.pin;

    light.on('identify', function(paired, callback) {
        FAKE_LIGHT.identify();
        callback(); // success
    });

    light
        .addService(Service.Lightbulb, lightParams.serviceName) // services exposed to the user should have "names" like "Fake Light" for us
        .getCharacteristic(Characteristic.On)
        .on('set', function(value, callback) {
            FAKE_LIGHT.setPowerOn(value);
            console.log('writing to pin: ', this.pin);
            callback(); // Our fake Light is synchronous - this value has been successfully set
        }.bind(light))
        .on('get', function(callback) {
            var err = null; // in case there were any problems

            if (FAKE_LIGHT.powerOn) {
                console.log("Are we on? Yes.");
                callback(err, true);
            }
            else {
                console.log("Are we on? No.");
                callback(err, false);
            }
        });

    lights.push(light);
});

module.exports = lights;
