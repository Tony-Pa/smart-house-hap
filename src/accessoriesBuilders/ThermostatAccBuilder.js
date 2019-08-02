const ThermostatAccessory = require('../models/thermostatAccessory.model');

module.exports = {
    build(config, { Accessory, Characteristic, Service, uuid }) {
        const UUID = this.generateUUID(config, { uuid });
        const accessory = new Accessory(config.serviceName, UUID);
        accessory.addService(Service.Thermostat, config.serviceName);

        const thermostatAccessory = new ThermostatAccessory(config);
        const service = accessory.getService(Service.Thermostat);

        accessory.on('identify', thermostatAccessory.identify.bind(thermostatAccessory));

        service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
        // "valid-values": [1, 2]
            .on('set', thermostatAccessory.setState.bind(thermostatAccessory))
            .on('get', thermostatAccessory.getState.bind(thermostatAccessory));

        service.getCharacteristic(Characteristic.TargetTemperature)
            .on('set', thermostatAccessory.setTemp.bind(thermostatAccessory))
            .on('get', thermostatAccessory.getTemp.bind(thermostatAccessory));

        service.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', thermostatAccessory.getCurrentTemp.bind(thermostatAccessory));

        thermostatAccessory.setCurrentTempCallback(service.setCharacteristic.bind(service, Characteristic.CurrentTemperature));

        if (config.tempHum) {
            service.addCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', thermostatAccessory.getCurrentHumidity.bind(thermostatAccessory));

            thermostatAccessory.setCurrentHumidityCallback(service.setCharacteristic.bind(service, Characteristic.CurrentRelativeHumidity));

            service.addCharacteristic(Characteristic.TargetRelativeHumidity)
                // .on('get', thermostatAccessory.getHumidity.bind(thermostatAccessory))
                .on('set', thermostatAccessory.setHumidity.bind(thermostatAccessory));
        }

        return accessory;
    },
    configure(accessory, config, { Characteristic, Service }) {
        const thermostatAccessory = new ThermostatAccessory(config);
        const service = accessory.getService(Service.Thermostat);

        accessory.on('identify', thermostatAccessory.identify.bind(thermostatAccessory));

        service.getCharacteristic(Characteristic.TargetHeatingCoolingState)
            // "valid-values": [1, 2]
            .on('set', thermostatAccessory.setState.bind(thermostatAccessory))
            .on('get', thermostatAccessory.getState.bind(thermostatAccessory));

        service.getCharacteristic(Characteristic.TargetTemperature)
            .on('set', thermostatAccessory.setTemp.bind(thermostatAccessory))
            .on('get', thermostatAccessory.getTemp.bind(thermostatAccessory));

        service.getCharacteristic(Characteristic.CurrentTemperature)
            .on('get', thermostatAccessory.getCurrentTemp.bind(thermostatAccessory));

        thermostatAccessory.setCurrentTempCallback(service.setCharacteristic.bind(service, Characteristic.CurrentTemperature));

        if (config.tempHum) {
            service.getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', thermostatAccessory.getCurrentHumidity.bind(thermostatAccessory));

            thermostatAccessory.setCurrentHumidityCallback(service.setCharacteristic.bind(service, Characteristic.CurrentRelativeHumidity));

            service.getCharacteristic(Characteristic.TargetRelativeHumidity)
                .on('get', thermostatAccessory.getHumidity.bind(thermostatAccessory))
                .on('set', thermostatAccessory.setHumidity.bind(thermostatAccessory));
        }
        return accessory;
    },
    generateUUID(config, { uuid }) {
        return uuid.generate('hap-nodejs:accessories:thermostat:' + config.id);
    }
};
