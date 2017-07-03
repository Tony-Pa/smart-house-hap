const path = require('path');
const storage = require('node-persist');
const accessoryLoader = require('hap-nodejs').AccessoryLoader;
const config = require('./config/main');

module.exports = function () {
  // Initialize our storage system
  storage.initSync();
  var targetPort = config.port;

  // Load up all accessories in the /accessories folder
  const dir = path.join(__dirname, 'accessories');
  const accessories = accessoryLoader.loadDirectory(dir);

// Publish them all separately (as opposed to BridgedCore which publishes them behind a single Bridge accessory)
  accessories.forEach(function (accessory) {
    // publish this Accessory on the local network
    accessory.publish({
      port: targetPort++,
      username: accessory.UUID,
      pincode: config.pincode
    });
  });
};

