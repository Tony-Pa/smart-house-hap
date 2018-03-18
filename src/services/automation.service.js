const Characteristic = require('hap-nodejs').Characteristic;

const accessoriesService = require('./accessories.service');
const timeout = {};

module.exports = {
    list: [],
    add(model) {
        this.list.push(model);
    },
    get(id) {
        return id >= 0 ? this.list[id] : this.list;
    },
    startAll() {
        this.get().forEach((cb) => cb())
    },
    create(automation, service) {
        let automationId = generateAutomationID(automation);
        return function(_automation, _service) {
            for(let c_characteristic in _automation.condition) {
                let skipFlag = false;
                let c_value = _automation.condition[c_characteristic];
                _service.getCharacteristic(Characteristic[c_characteristic])
                    .on('set', (value) => {
                        if (value === c_value && !skipFlag) {
                            clearTimeout(timeout[automationId]);
                            timeout[automationId] = setTimeout(() => {
                                for(let a_characteristic in _automation.action) {
                                    let a_value = _automation.action[a_characteristic];
                                    accessoriesService.get(_automation.id)
                                        .setCharacteristic(Characteristic[a_characteristic], a_value);
                                }
                            }, _automation.timeout || 0);
                        }

                        if (_automation.stop) {
                            _automation.stop.forEach((_stop) => {
                                let stopAutomationId = generateAutomationID(_stop);
                                for(let s_characteristic in _automation.condition) {
                                    let s_value = _automation.condition[s_characteristic];
                                    accessoriesService.get(_stop.id)
                                        .getCharacteristic(Characteristic[s_characteristic])
                                        .on('set', (value) => {
                                            if (value === s_value) {
                                                skipFlag = true;
                                                clearTimeout(timeout[stopAutomationId]);
                                                timeout[stopAutomationId] = setTimeout(() => {
                                                    skipFlag = false;
                                                }, _stop.timeout || 0);
                                            }
                                        })
                                }
                            });
                        }
                    });
            }
        }.bind(this, automation, service);

        function generateAutomationID(automation) {
            let {id, condition, action, timeout} = automation;
            return JSON.stringify({id, condition, action, timeout})
        }
    }
};
