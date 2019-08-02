const Accessory = require('hap-nodejs').Accessory;
const Service = require('hap-nodejs').Service;
const Characteristic = require('hap-nodejs').Characteristic;
const uuid = require('hap-nodejs').uuid;

const thermostatAccBuilder = require('../accessoriesBuilders/ThermostatAccBuilder');
const thermostatConfig = require('../config/termostat.json');

module.exports = thermostatConfig.map((thermostatParams) =>
    thermostatAccBuilder.build(thermostatParams, { Accessory, Characteristic, Service, uuid}));
