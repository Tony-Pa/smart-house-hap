const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const motionConfig = require('../config/motionSensor.json');
const motionAccessoryBuilder = require('../accessoriesBuilders/MotionSensorAccBuilder');

module.exports = motionConfig.map((motionParams) =>
    motionAccessoryBuilder.build(motionParams, { Accessory, Characteristic, Service, uuid}));
