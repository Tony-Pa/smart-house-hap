"use strict";
const debug = require('debug')('SH:VC');
const miio = require('miio');
const Characteristic = require('hap-nodejs').Characteristic;

class VacuumCleaner {
    constructor(params) {
        this.ip = params.ip;
        this.token = params.token;

        this.discover();
    }

    discover() {
        miio.device({
            address: this.ip,
            token: this.token,
            model: 'rockrobo.vacuum.v1'
        })
            .then((device) => {
                if (device.matches('type:vaccuum')) {
                    this.device = device;

                    debug('Discovered Mi Robot Vacuum at %s', this.ip);

                    debug('Model         : ' + device.miioModel);
                    debug('State         : ' + device.property('state'));
                    debug('Fan Speed     : ' + device.property('fanSpeed'));
                    debug('Battery Level : ' + device.property('batteryLevel'));

                    device.state()
                        .then((state) => {
                            if (state.error !== undefined) {
                                console.log(state.error);
                                return;
                            }

                            // Initial states
                            this.updateCleaningState(state.cleaning);
                            this.updateChargingState(state.charging);
                            this.updateFanSpeed(state.fanSpeed);
                            this.updateBatteryLevel(state.batteryLevel);


                            const actions = {
                                cleaning: this.updateCleaningState.bind(this),
                                charging: this.updateChargingState.bind(this),
                                fanSpeed: this.updateFanSpeed.bind(this),
                                batteryLevel: this.updateBatteryLevel.bind(this)
                            };

                            // State change events
                            device.on('stateChanged', ({ key, value }) => actions[key] && actions[key](value));
                        })
                        .catch((err) => console.log(err));
                }
                else {
                    debug('Device discovered at %s is not Mi Robot Vacuum', this.ip);
                }
            })
            .catch(() => {
                debug('Failed to discover Mi Robot Vacuum at %s', this.ip);
                debug('Will retry after 30 seconds');
                setTimeout(() => this.discover(), 30000);
            });
    }

    updateCleaningState(state) {
        debug('Cleaning State -> %s', state);
        this.cleaningState = state;
    }

    updateChargingState(state) {
        debug('Charging State -> %s', state);
        this.chargingState = state;
        this.batteryService.getCharacteristic(Characteristic.ChargingState).updateValue(state);
    }

    updateFanSpeed(speed) {
        debug('Fan Speed -> %s', speed);
        this.fanSpeed = speed;
        this.fanService.getCharacteristic(Characteristic.RotationSpeed).updateValue(speed);
    }

    updateBatteryLevel(level) {
        debug('Battery Level -> %s', level);
        this.batteryLevel = level;
        this.batteryService.getCharacteristic(Characteristic.BatteryLevel).updateValue(level);
    }

    getPowerState(callback) {
        if (!this.device) {
            callback(new Error('No robot is discovered.'));
            return;
        }

        callback(null, this.cleaningState);
    }

    setPowerState(state, callback) {
        if (!this.device) {
            callback(new Error('No robot is discovered.'));
            return;
        }

        if (state) {
            this.device.activateCleaning();
        } else {
            this.device.call('app_stop', []);

            setTimeout(() => this.device.call('app_charge', [], {
                refresh: ['state'],
                refreshDelay: 1000
            }), 2000);
        }

        callback();
    }

    getRotationSpeed(callback) {
        if (!this.device) {
            callback(new Error('No robot is discovered.'));
            return;
        }

        callback(null, this.fanSpeed);
    }

    setRotationSpeed(speed, callback) {
        if (!this.device) {
            callback(new Error('No robot is discovered.'));
            return;
        }

        var speeds = [
            0,	// Idle
            38,	// Quiet
            60,	// Balanced
            77,	// Turbo
            90	// Max Speed
        ];

        for (let item in speeds) {
            if (speed <= item) {
                speed = item;
                break;
            }
        }

        this.device.changeFanSpeed(parseInt(speed));
        callback(null, speed);
    }

    getBatteryLevel(callback) {
        if (!this.device) {
            callback(new Error('No robot is discovered.'));
            return;
        }

        callback(null, this.batteryLevel);
    }

    getStatusLowBattery(callback) {
        if (!this.device) {
            callback(new Error('No robot is discovered.'));
            return;
        }

        callback(
            null,
            this.batteryLevel < 30
                ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
                : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
    }

    getChargingState(callback) {
        if (!this.device) {
            callback(new Error('No robot is discovered.'));
            return;
        }

        callback(
            null,
            this.chargingState
                ? Characteristic.ChargingState.CHARGING
                : Characteristic.ChargingState.NOT_CHARGEABLE
        );
    }

    identify(paired, callback) {
        debug('identify', paired);
        callback();
    }
}

module.exports = VacuumCleaner;
