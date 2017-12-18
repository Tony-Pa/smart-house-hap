const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;
const LightAccessory = require('../models/lightAccessory.model');
const lightConfig = require('../config/light.json');

const lights = [];

lightConfig.forEach((lightParams) => {
    const lightUUID = uuid.generate('hap-nodejs:accessories:light:' + lightParams.id);
    const light = new Accessory(lightParams.serviceName, lightUUID);
    const service = light.addService(Service.Lightbulb, lightParams.serviceName);

    const lightAccessory = new LightAccessory(lightParams);

    light.on('identify', lightAccessory.identify.bind(lightAccessory));

    const onCharacteristic = service.getCharacteristic(Characteristic.On)
        .on('set', lightAccessory.set.bind(lightAccessory))
        .on('get', lightAccessory.get.bind(lightAccessory));

    let timeoutId;
    lightAccessory.setCurrentStatusCallback(() => {
        setOnCharacteristic(true);

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setOnCharacteristic(false), 500);
    });

    if (lightParams.rgb) {
        service.addCharacteristic(Characteristic.Brightness)
            .on('set', lightAccessory.setBrightness.bind(lightAccessory));

        service.addCharacteristic(Characteristic.Saturation)
            .on('set', lightAccessory.setSaturation.bind(lightAccessory));

        service.addCharacteristic(Characteristic.Hue)
            .on('set', lightAccessory.setHue.bind(lightAccessory));
    }


    function setOnCharacteristic(newValue) {
        let oldValue = onCharacteristic.value;
        if (onCharacteristic.eventOnlyCharacteristic === true || oldValue !== newValue) {
            onCharacteristic.value = newValue;
            onCharacteristic.emit('change', { oldValue, newValue });
            lightAccessory.status = newValue;
        }
    }

    lights.push(light);
});

module.exports = lights;
