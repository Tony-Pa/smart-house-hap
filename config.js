const lightConfig = require('./src/config/light.json');
const switchConfig = require('./src/config/switch.json');
const motionSensorConfig = require('./src/config/motionSensor');
const thermostatConfig = require('./src/config/termostat.json');

module.exports = {
    bridge: {
        name: 'Homebridge',
        username: '10:00:00:00:00:00',
        port: 51820,
        pin: '123-45-678',
    },
    accessories: [
    ],
    platforms: [
        {
            platform: 'SmartHousePlatform',
            lights: [
                ...lightConfig,
            ],
            fans: [
                ...switchConfig,
             ],
            thermostats: [
                ...thermostatConfig,
            ],
            motionSensors: [
                ...motionSensorConfig,
            ]
        },
    ]
};
