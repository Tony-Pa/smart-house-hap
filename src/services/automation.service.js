const Characteristic = require('hap-nodejs').Characteristic;

const accessoriesService = require('./accessories.service');
const timeoutCache = {};

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
  create(_automation_, _service_) {
    const automationId = generateAutomationID(_automation_);
    return function (automation, service) {
      const { key: conditionCharacteristic, value: condition } = splitKeyValue(automation.condition);
      let stopAutomation = false;

      service.getCharacteristic(Characteristic[conditionCharacteristic])
        .on('set', function (value) {

          if (checkCondition(value, condition) && !stopAutomation) {
            cacheTimeout(automationId, () => {
              const {key: actionCharacteristic, value: actionValue} = splitKeyValue(automation.action);

              accessoriesService.get(automation.id)
                .setCharacteristic(Characteristic[actionCharacteristic], actionValue);

            }, automation.timeout);
          }

          if (automation.stop) {
            automation.stop.forEach((stop) => {
              let stopAutomationId = generateAutomationID(stop);
              const { key: stopCharacteristic, value: stopValue } = splitKeyValue(stop.condition);

              accessoriesService.get(stop.id).getCharacteristic(Characteristic[stopCharacteristic])
                .on('set', (value) => {

                  if (checkCondition(value, stopValue)) {
                    stopAutomation = true;
                    cacheTimeout(stopAutomationId, () => { stopAutomation = false; }, stop.timeout);
                  }
                })
            });
          }
        });
    }.bind(this, _automation_, _service_);
  }
};

function generateAutomationID(automation) {
  let {id, condition, action, timeout} = automation;
  return JSON.stringify({id, condition, action, timeout})
}

function checkCondition(value, conditionObj) {
  if (conditionObj instanceof Object) {
    const { key: condition, value: conditionValue } = splitKeyValue(conditionObj);
    switch (condition) {
      case '==':
        return value == conditionValue;
      case '===':
        return value === conditionValue;
      case '>=':
        return value >= conditionValue;
      case '>':
        return value > conditionValue;
      case '<=':
        return value <= conditionValue;
      case '<':
        return value < conditionValue;
    }
  }
  else {
    return value === conditionObj
  }
}

function splitKeyValue(obj) {
  return {
    key: Object.keys(obj)[0],
    value: Object.values(obj)[0]
  };
}

function cacheTimeout(automationId, callback, timeout) {
  clearTimeout(timeoutCache[automationId]);
  timeoutCache[automationId] = setTimeout(callback, timeout || 0);
}
