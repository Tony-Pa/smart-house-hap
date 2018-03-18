const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const MotionAccessory = require('../models/motionSensor.model');
const motionConfig = require('../config/motionSensor.json');
const accessoriesService = require('../services/accessories.service');
const automationService = require('../services/automation.service');

const motionSensors = [];

motionConfig.forEach((motionParams) => {
    const motionAccessory = new MotionAccessory(motionParams);

    const motionSensorUUID = uuid.generate('hap-nodejs:accessories:motionSensor' + motionParams.id);
    const motionSensor = new Accessory(motionParams.serviceName, motionSensorUUID);

    motionSensor.on('identify', motionAccessory.identify.bind(motionAccessory));

    const service = motionSensor.addService(Service.MotionSensor, motionParams.serviceName);
    service.getCharacteristic(Characteristic.MotionDetected)
        .on('set', motionAccessory.set.bind(motionAccessory))
        .on('get', motionAccessory.get.bind(motionAccessory));

    let timeoutId;
    motionAccessory.setCurrentStatusCallback(() => {
        service.setCharacteristic(Characteristic.MotionDetected, true);

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => service.setCharacteristic(Characteristic.MotionDetected, false), 10000);
    });

    if (motionParams.automations) {
        motionParams.automations.forEach((automation) => {
            automationService.add(automationService.create(automation, service))
        });
    }

    motionSensors.push(motionSensor);
    accessoriesService.add(service, motionParams.id);
});

module.exports = motionSensors;
