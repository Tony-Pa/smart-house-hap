const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const lightAccessoryBuilder = require('../accessoriesBuilders/LightAccBuilder');
const lightConfig = require('../config/light.json');

module.exports = lightConfig.map((lightParams) =>
    lightAccessoryBuilder.build(lightParams, { Accessory, Characteristic, Service, uuid}));
