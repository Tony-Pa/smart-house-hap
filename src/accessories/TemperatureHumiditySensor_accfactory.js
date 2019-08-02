const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;
const TempHumAccessory = require('../models/temperatureHumidityAccessory.model');
const termHumConfig = require('../config/termHum.json');

const accessoriesService = require('../services/accessories.service');
const automationService = require('../services/automation.service');

module.exports = termHumConfig.map((params) => {
    const tempHumAccessory = new TempHumAccessory(params);

    const sensorUUID = uuid.generate('hap-nodejs:accessories:tempsHumSensors' + params.id);
    const sensor = new Accessory(params.serviceName, sensorUUID);

    sensor.on('identify', tempHumAccessory.identify.bind(tempHumAccessory));

    const tempService = sensor.addService(Service.TemperatureSensor, 'Температура');
    tempService.getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', tempHumAccessory.getTemp.bind(tempHumAccessory));

    tempHumAccessory.setTempCallback(
        tempService.setCharacteristic.bind(tempService, Characteristic.CurrentTemperature)
    );

    const humService = sensor.addService(Service.HumiditySensor, 'Влажность');
    tempService.addLinkedService(humService);

    humService.getCharacteristic(Characteristic.CurrentRelativeHumidity)
        .on('get', tempHumAccessory.getHum.bind(tempHumAccessory));

    tempHumAccessory.setHumCallback(
        humService.setCharacteristic.bind(humService, Characteristic.CurrentRelativeHumidity)
    );

    if (params.automations) {
        params.automations.forEach((automation) => {
            automationService.add(automationService.create(automation, humService))
        });
    }

    accessoriesService.add(humService, params.id);
    return sensor;
});
