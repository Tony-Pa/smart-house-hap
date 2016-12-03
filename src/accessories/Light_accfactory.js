var Accessory = require('hap-nodejs').Accessory;
var Service = require('hap-nodejs').Service;
var Characteristic = require('hap-nodejs').Characteristic;
var uuid = require('hap-nodejs').uuid;

var LightAccessory = require('../models/lightAccessory.model');
var lightService = require('../services/light.service');
var lightConfig = require('../config/light.json');

var lights = [];

lightConfig.forEach((lightParams) => {

    var lightUUID = uuid.generate('hap-nodejs:accessories:light:' + lightParams.id);
    var light = new Accessory(lightParams.name, lightUUID);

    var lightAccessory = new LightAccessory(lightParams);
    lightService.add(lightAccessory);

    light.on('identify', lightAccessory.identify.bind(lightAccessory));

    light
        .addService(Service.Lightbulb, lightParams.serviceName)
        .getCharacteristic(Characteristic.On)
        .on('set', lightAccessory.set.bind(lightAccessory))
        .on('get', lightAccessory.get.bind(lightAccessory));

    lights.push(light);
});

module.exports = lights;
