const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;
const ThermostatAccessory = require('../models/thermostatAccessory.model');
const thermostatConfig = require('../config/termostat.json');

const thermostats = [];

thermostatConfig.forEach((thermostatParams) => {
    let thermostatUUID = uuid.generate('hap-nodejs:accessories:thermostat:' + thermostatParams.id);
    let thermostat = new Accessory(thermostatParams.serviceName, thermostatUUID);
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

    thermostatAccessory.setCurrentTempCallback(service.setCharacteristic.bind(service, Characteristic.CurrentTemperature));

    thermostats.push(thermostat);
});

module.exports = thermostats;
