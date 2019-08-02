const LightAccessory = require('../models/lightAccessory.model');
const accessoriesService = require('../services/accessories.service');
const automationService = require('../services/automation.service');

module.exports = {
    build(config, { Accessory, Characteristic, Service, uuid }) {
        const lightUUID = this.generateUUID(config, { uuid });
        const accessory = new Accessory(config.serviceName, lightUUID);
        const service = accessory.addService(Service.Lightbulb, config.serviceName);

        const lightAccessory = new LightAccessory(config);

        accessory.on('identify', lightAccessory.identify.bind(lightAccessory));

        service.getCharacteristic(Characteristic.On)
            .on('set', lightAccessory.set.bind(lightAccessory))
            .on('get', lightAccessory.get.bind(lightAccessory));

        lightAccessory.setOnCharacteristic(service.setCharacteristic.bind(service, Characteristic.On));

        if (config.rgb) {
            service.addCharacteristic(Characteristic.Brightness)
                .on('set', lightAccessory.setBrightness.bind(lightAccessory));

            service.addCharacteristic(Characteristic.Saturation)
                .on('set', lightAccessory.setSaturation.bind(lightAccessory));

            service.addCharacteristic(Characteristic.Hue)
                .on('set', lightAccessory.setHue.bind(lightAccessory));
        }

        if (config.automations) {
            config.automations.forEach((automation) => {
                automationService.add(automationService.create(automation, service))
            });
        }

        accessoriesService.add(service, config.id);

        return accessory;
    },
    configure(accessory, config, { Characteristic, Service }) {
        const lightAccessory = new LightAccessory(config);
        const service = accessory.getService(Service.Lightbulb);

        accessory.on('identify', lightAccessory.identify.bind(lightAccessory));

        service.getCharacteristic(Characteristic.On)
            .on('set', lightAccessory.set.bind(lightAccessory))
            .on('get', lightAccessory.get.bind(lightAccessory));


        lightAccessory.setOnCharacteristic(service.setCharacteristic.bind(service, Characteristic.On));

        if (config.rgb) {
            service.getCharacteristic(Characteristic.Brightness)
                .on('set', lightAccessory.setBrightness.bind(lightAccessory));

            service.getCharacteristic(Characteristic.Saturation)
                .on('set', lightAccessory.setSaturation.bind(lightAccessory));

            service.getCharacteristic(Characteristic.Hue)
                .on('set', lightAccessory.setHue.bind(lightAccessory));
        }

        if (config.automations) {
            config.automations.forEach((automation) => {
                automationService.add(automationService.create(automation, service))
            });
        }

        accessoriesService.add(service, config.id);

        return accessory;
    },
    generateUUID(config, { uuid }) {
        return uuid.generate('hap-nodejs:accessories:light:' + config.id);
    }
};
