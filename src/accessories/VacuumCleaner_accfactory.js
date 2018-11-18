const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const VacuumCleaner = require('../models/vacuumCleaner.model');
const vCleanerConfig = require('../config/vacuumCleaner.json');

module.exports = vCleanerConfig.map((vCleanerParams) => {
    const vCleanerAccessory = new VacuumCleaner(vCleanerParams);
    const vCleanerUUID = uuid.generate('hap-nodejs:accessories:vcleaner:' + vCleanerParams.id);
    const vCleaner = new Accessory(vCleanerParams.serviceName, vCleanerUUID);

    const fanService = vCleaner.addService(Service.Fan, vCleanerParams.serviceName);
    const batteryService = vCleaner.addService(Service.BatteryService, vCleanerParams.serviceName + ' Battery');


    vCleanerAccessory.fanService = fanService;
    vCleanerAccessory.batteryService = batteryService;


    vCleaner.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, 'Xiaomi')
        .setCharacteristic(Characteristic.Model, 'Robot Vacuum Cleaner');

    fanService.getCharacteristic(Characteristic.On)
        .on('get', vCleanerAccessory.getPowerState.bind(vCleanerAccessory))
        .on('set', vCleanerAccessory.setPowerState.bind(vCleanerAccessory));

    fanService.getCharacteristic(Characteristic.RotationSpeed)
        .on('get', vCleanerAccessory.getRotationSpeed.bind(vCleanerAccessory))
        .on('set', vCleanerAccessory.setRotationSpeed.bind(vCleanerAccessory));

    batteryService.getCharacteristic(Characteristic.BatteryLevel)
        .on('get', vCleanerAccessory.getBatteryLevel.bind(vCleanerAccessory));

    batteryService.getCharacteristic(Characteristic.ChargingState)
        .on('get', vCleanerAccessory.getChargingState.bind(vCleanerAccessory));

    batteryService.getCharacteristic(Characteristic.StatusLowBattery)
        .on('get', vCleanerAccessory.getStatusLowBattery.bind(vCleanerAccessory));

    vCleaner.on('identify', vCleanerAccessory.identify.bind(vCleanerAccessory));


    return vCleaner;
});
