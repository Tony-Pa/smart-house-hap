const LightAccessory = require('../models/lightAccessory.model');

module.exports = {
    build(config, { Accessory, Characteristic, Service, uuid }) {
        const UUID = this.generateUUID(config, { uuid });
        const accessory = new Accessory(config.serviceName, UUID);
        accessory.addService(Service.Switch, config.serviceName);

        return this.configure(accessory, config, { Characteristic, Service });
    },
    configure(accessory, config, { Characteristic, Service }) {
        const switchAccessory = new LightAccessory(config);
        const service = accessory.getService(Service.Switch);

        accessory.on('identify', switchAccessory.identify.bind(switchAccessory));

        service.getCharacteristic(Characteristic.On)
            .on('set', switchAccessory.set.bind(switchAccessory))
            .on('get', switchAccessory.get.bind(switchAccessory));

        switchAccessory.setOnCharacteristic(service.setCharacteristic.bind(service, Characteristic.On));

        return accessory;
    },
    generateUUID(config, { uuid }) {
        return uuid.generate('hap-nodejs:accessories:fan:' + config.id);
    }
};
