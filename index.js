const boardService = require('./src/services/board.service');
const config = require('./src/config/main');
const lightAccessoryBuilder = require('./src/accessoriesBuilders/LightAccBuilder');
const fanAccessoryBuilder = require('./src/accessoriesBuilders/FanAccBuilder');
const motionAccessoryBuilder = require('./src/accessoriesBuilders/MotionSensorAccBuilder');
const thermostatAccBuilder = require('./src/accessoriesBuilders/ThermostatAccBuilder');

const automationService = require('./src/services/automation.service');

const devices = [
    {
        type: 'fans',
        builder: fanAccessoryBuilder,
    },
    {
        type: 'lights',
        builder: lightAccessoryBuilder,
    },
    {
        type: 'motionSensors',
        builder: motionAccessoryBuilder,
    },
    {
        type: 'thermostats',
        builder: thermostatAccBuilder,
    },
];

const local = false;
const Arduino = local
    ? require('./src/node-arduino.mock.js')
    : require('node-arduino');

module.exports = function(homebridge) {
    const lightStatusBoard = new Arduino.connect(config.lightStatusBoard);
    const motionTempStatusBoard = new Arduino.connect(config.thermostatBoard);
    boardService.add(lightStatusBoard, config.lightStatusBoard);
    boardService.add(motionTempStatusBoard, config.thermostatBoard);
    boardService.openAll(() => {});

    homebridge.registerPlatform('homebridge-smartHousePlatform', 'SmartHousePlatform', SmartHousePlatform, true);
};


class SmartHousePlatform {
    constructor(log, config, api) {
        this.accessories = {};
        api.on('didFinishLaunching', () => this.didFinishLaunching(config, api));
    }
    didFinishLaunching(config, api) {
        const { Service, Characteristic, uuid } = api.hap;
        const apiParams = { Accessory: api.platformAccessory, Characteristic, Service, uuid};
        const accessories = {};

        devices.forEach((device) => {
            config[device.type].forEach((lightConfig) => {
                const UUID = device.builder.generateUUID(lightConfig, { uuid });
                if (!this.accessories[UUID]) {
                    const accessory = device.builder.build(lightConfig, apiParams);
                    this.accessories[UUID] = accessories[UUID] = accessory;
                }
                else {
                    this.accessories[UUID] = device.builder.configure(this.accessories[UUID], lightConfig, apiParams);
                }
            });
        });

        api.registerPlatformAccessories('homebridge-smartHousePlatform', 'SmartHousePlatform', accessories);

        automationService.startAll();
    }

    configureAccessory(accessory) {
        this.accessories[accessory.UUID] = accessory;
    }
}
