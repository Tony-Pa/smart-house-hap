const lightConfig = require('./src/config/light.json');
const fanConfig = require('./src/config/fan.json');
const motionSensorConfig = require('./src/config/motionSensor');
const thermostatConfig = require('./src/config/termostat.json');

module.exports = {
    bridge: {
        name: 'Homebridge',
        username: '10:00:00:00:00:00',
        port: 51820,
        pin: '321-67-890',
    },
    accessories: [
        {
            accessory: 'MiRobotVacuum',
            name: 'Пылесос',
            ip: '192.168.88.15',
            token: '4a64344947525a667046774d734f5152',
            pause: false
        },
        {
            accessory: 'lgtv-2012',
            name: 'TV',
            ip: '192.168.88.17',
            pairingKey: '276887',
            min_volume: 2,
            max_volume: 20,
            on_command: 'MUTE',
            debug: true,
        }
    ],
    platforms: [
        {
            platform: 'config',
            name: 'Config',
            port: 8080,
            sudo: false
        },
        {
            platform: 'SmartHousePlatform',
            lights: [
                ...lightConfig,
            ],
            fans: [
                ...fanConfig,
             ],
            thermostats: [
                ...thermostatConfig,
            ],
            motionSensors: [
                ...motionSensorConfig,
            ]
        },
        {
            platform: 'Camera-ffmpeg',
            cameras: [
                {
                    name: 'Камера у входа',
                    videoConfig: {
                        source: '-rtsp_transport tcp -y -i rtsp://admin:admin@192.168.88.22:554/Streaming/Channels/101',
                        stillImageSource: '-i http://192.168.88.22/Streaming/Channels/101/picture',
                        maxBitrate: 1600,
                        maxFPS: 30,
                        maxStreams: 2,
                        maxWidth: 1920,
                        maxHeight: 1080,
                        vcodec: 'h264_omx',
                        audio: false
                    }
                }
            ]
        }
    ]
};
