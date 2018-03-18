const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const LightAccessory = require('../models/lightAccessory.model');
const lightConfig = require('../config/light.json');
const accessoriesService = require('../services/accessories.service');
const automationService = require('../services/automation.service');

const lights = [];

lightConfig.forEach((lightParams) => {
    const lightUUID = uuid.generate('hap-nodejs:accessories:light:' + lightParams.id);
    const light = new Accessory(lightParams.serviceName, lightUUID);
    const service = light.addService(Service.Lightbulb, lightParams.serviceName);

    const lightAccessory = new LightAccessory(lightParams);

    light.on('identify', lightAccessory.identify.bind(lightAccessory));

    service.getCharacteristic(Characteristic.On)
        .on('set', lightAccessory.set.bind(lightAccessory))
        .on('get', lightAccessory.get.bind(lightAccessory));

    lightAccessory.setOnCharacteristic(service.setCharacteristic.bind(service, Characteristic.On));

    if (lightParams.rgb) {
        service.addCharacteristic(Characteristic.Brightness)
            .on('set', lightAccessory.setBrightness.bind(lightAccessory));

        service.addCharacteristic(Characteristic.Saturation)
            .on('set', lightAccessory.setSaturation.bind(lightAccessory));

        service.addCharacteristic(Characteristic.Hue)
            .on('set', lightAccessory.setHue.bind(lightAccessory));
    }

    if (lightParams.automations) {
        lightParams.automations.forEach((automation) => {
            automationService.add(automationService.create(automation, service))
        });
    }

    lights.push(light);
    accessoriesService.add(service, lightParams.id);
});

module.exports = lights;
