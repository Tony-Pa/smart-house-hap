var Accessory = require('hap-nodejs').Accessory;
var Service = require('hap-nodejs').Service;
var Characteristic = require('hap-nodejs').Characteristic;
var uuid = require('hap-nodejs').uuid;
var ThermostatAccessory = require('../models/thermostatAccessory.model');
var thermostatConfig = require('../config/termostat.json');

var thermostats = [];

thermostatConfig.forEach((thermostatParams) => {

    let thermostatUUID = uuid.generate('hap-nodejs:accessories:thermostat:' + thermostatParams.id);
    let thermostat = new Accessory(thermostatParams.name, thermostatUUID);
    let thermostatAccessory = new ThermostatAccessory(thermostatParams);

    thermostat.on('identify', thermostatAccessory.identify.bind(thermostatAccessory));

    let service = thermostat
        .addService(Service.Thermostat, thermostatParams.serviceName);


    service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
    // "valid-values": [1, 2]
        .on('set', thermostatAccessory.setState.bind(thermostatAccessory))
        .on('get', thermostatAccessory.getState.bind(thermostatAccessory));

    service.getCharacteristic(Characteristic.TargetTemperature)
        .on('set', thermostatAccessory.setTemp.bind(thermostatAccessory))
        .on('get', thermostatAccessory.getTemp.bind(thermostatAccessory));

    service.getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', thermostatAccessory.getCurrentTemp.bind(thermostatAccessory));

    thermostats.push(thermostat);
});

module.exports = thermostats;
