const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;
const LightAccessory = require('../models/lightAccessory.model');
const fanConfig = require('../config/fan.json');

const fans = [];

fanConfig.forEach((fanParams) => {
    const fanUUID = uuid.generate('hap-nodejs:accessories:fan:' + fanParams.id);
    const fan = new Accessory(fanParams.serviceName, fanUUID);
    const service = fan.addService(Service.Fan, fanParams.serviceName);

    const fanAccessory = new LightAccessory(fanParams);

    fan.on('identify', fanAccessory.identify.bind(fanAccessory));

    const onCharacteristic = service.getCharacteristic(Characteristic.On)
        .on('set', fanAccessory.set.bind(fanAccessory))
        .on('get', fanAccessory.get.bind(fanAccessory));

    fanAccessory.setCurrentStatusCallback(function (newValue) {
        let oldValue = onCharacteristic.value;
        if (onCharacteristic.eventOnlyCharacteristic === true || oldValue !== newValue) {
            onCharacteristic.value = newValue;
            onCharacteristic.emit('change', { oldValue, newValue });
        }
    });

    let timeoutId;
    fanAccessory.setCurrentStatusCallback(() => {
        setOnCharacteristic(true);

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setOnCharacteristic(false), 1000);
    });

    function setOnCharacteristic(newValue) {
        let oldValue = onCharacteristic.value;
        if (onCharacteristic.eventOnlyCharacteristic === true || oldValue !== newValue) {
            onCharacteristic.value = newValue;
            onCharacteristic.emit('change', { oldValue, newValue });
            fanAccessory.status = newValue;
        }
    }


    fans.push(fan);
});

module.exports = fans;
