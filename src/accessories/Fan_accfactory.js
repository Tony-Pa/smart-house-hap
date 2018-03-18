const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const LightAccessory = require('../models/lightAccessory.model');
const fanConfig = require('../config/fan.json');
const accessoriesService = require('../services/accessories.service');

const fans = [];

fanConfig.forEach((fanParams) => {
    const fanUUID = uuid.generate('hap-nodejs:accessories:fan:' + fanParams.id);
    const fan = new Accessory(fanParams.serviceName, fanUUID);
    const service = fan.addService(Service.Fan, fanParams.serviceName);

    const fanAccessory = new LightAccessory(fanParams);

    fan.on('identify', fanAccessory.identify.bind(fanAccessory));

    service.getCharacteristic(Characteristic.On)
        .on('set', fanAccessory.set.bind(fanAccessory))
        .on('get', fanAccessory.get.bind(fanAccessory));

    fanAccessory.setOnCharacteristic(service.setCharacteristic.bind(service, Characteristic.On));

    fans.push(fan);
    accessoriesService.add(service, fanParams.id);
});

module.exports = fans;
