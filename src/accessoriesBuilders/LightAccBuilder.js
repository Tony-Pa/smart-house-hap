const LightAccessory = require('../models/lightAccessory.model');

module.exports = {
    build(config, { Accessory, Characteristic, Service, uuid }) {
        const lightUUID = this.generateUUID(config, { uuid });
        const accessory = new Accessory(config.serviceName, lightUUID);

        accessory.addService(Service.Lightbulb, config.serviceName);

        return this.configure(accessory, config, { Characteristic, Service });
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

        return accessory;
    },
    generateUUID(config, { uuid }) {
        return uuid.generate('hap-nodejs:accessories:light:' + config.id);
    }
};
