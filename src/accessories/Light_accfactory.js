const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;
const LightAccessory = require('../models/lightAccessory.model');
const lightConfig = require('../config/light.json');

const lights = [];

lightConfig.forEach((lightParams) => {

    const lightUUID = uuid.generate('hap-nodejs:accessories:light:' + lightParams.id);
    const light = new Accessory(lightParams.name, lightUUID);
    const service = light.addService(Service.Lightbulb, lightParams.serviceName);

    const lightAccessory = new LightAccessory(lightParams);

    light.on('identify', lightAccessory.identify.bind(lightAccessory));

    const onCharacteristic = service.getCharacteristic(Characteristic.On)
        .on('set', lightAccessory.set.bind(lightAccessory))
        .on('get', lightAccessory.get.bind(lightAccessory));

    lightAccessory.setCurrentStatusCallback(function (newValue) {
        let oldValue = onCharacteristic.value;
        if (onCharacteristic.eventOnlyCharacteristic === true || oldValue !== newValue) {
            onCharacteristic.value = newValue;
            onCharacteristic.emit('change', { oldValue, newValue });
        }
    });
    lights.push(light);
});

module.exports = lights;
