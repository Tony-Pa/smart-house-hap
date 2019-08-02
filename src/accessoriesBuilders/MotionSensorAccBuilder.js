const MotionAccessory = require('../models/motionSensor.model');
const accessoriesService = require('../services/accessories.service');
const automationService = require('../services/automation.service');

module.exports = {
    build(config, { Accessory, Characteristic, Service, uuid }) {
        const UUID = this.generateUUID(config, { uuid });
        const accessory = new Accessory(config.serviceName, UUID);

        accessory.addService(Service.MotionSensor, config.serviceName);

        return this.configure(accessory, config, { Characteristic, Service });
    },
    configure(accessory, config, { Characteristic, Service }) {
        const motionAccessory = new MotionAccessory(config);
        const service = accessory.getService(Service.MotionSensor);

        accessory.on('identify', motionAccessory.identify.bind(motionAccessory));

        service.getCharacteristic(Characteristic.MotionDetected)
            .on('set', motionAccessory.set.bind(motionAccessory))
            .on('get', motionAccessory.get.bind(motionAccessory));

        motionAccessory.setCurrentStatusCallback((val) => service.setCharacteristic(Characteristic.MotionDetected, val));

        if (config.automations) {
            config.automations.forEach((automation) => {
                automationService.add(automationService.create(automation, service))
            });
        }

        accessoriesService.add(service, config.id);
        return accessory;
    },
    generateUUID(config, { uuid }) {
        return uuid.generate('hap-nodejs:accessories:motionSensor' + config.id);
    }
};
