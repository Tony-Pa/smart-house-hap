const LightAccessory = require('../models/lightAccessory.model');
const accessoriesService = require('../services/accessories.service');

module.exports = {
    build(config, { Accessory, Characteristic, Service, uuid }) {
        const UUID = this.generateUUID(config, { uuid });
        const accessory = new Accessory(config.serviceName, UUID);
        accessory.addService(Service.Fan, config.serviceName);

        return this.configure(accessory, config, { Characteristic, Service });
    },
    configure(accessory, config, { Characteristic, Service }) {
        const fanAccessory = new LightAccessory(config);
        const service = accessory.getService(Service.Fan);

        accessory.on('identify', fanAccessory.identify.bind(fanAccessory));

        service.getCharacteristic(Characteristic.On)
            .on('set', fanAccessory.set.bind(fanAccessory))
            .on('get', fanAccessory.get.bind(fanAccessory));

        fanAccessory.setOnCharacteristic(service.setCharacteristic.bind(service, Characteristic.On));

        accessoriesService.add(service, config.id);

        return accessory;
    },
    generateUUID(config, { uuid }) {
        return uuid.generate('hap-nodejs:accessories:fan:' + config.id);
    }
};
