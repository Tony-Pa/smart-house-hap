const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const fanAccessoryBuilder = require('../accessoriesBuilders/FanAccBuilder');
const fanConfig = require('../config/fan.json');

module.exports = fanConfig.map((fanParams) =>
    fanAccessoryBuilder.build(fanParams, { Accessory, Characteristic, Service, uuid}));
