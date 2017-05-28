const path = require('path');
const storage = require('node-persist');
const uuid = require('hap-nodejs').uuid;
const Bridge = require('hap-nodejs').Bridge;
const Accessory = require('hap-nodejs').Accessory;
const accessoryLoader = require('hap-nodejs').AccessoryLoader;
const config = require('./config/main');

module.exports = function () {
    // Initialize our storage system
    storage.initSync();

    let bridge = new Bridge('Smart House Accessories', uuid.generate('Smart House Node Bridge'));

    bridge.on('identify', function (paired, callback) {
        console.log('Node Bridge identify');
        callback();
    });

    let dir = path.join(__dirname, 'accessories');
    let accessories = accessoryLoader.loadDirectory(dir);

    accessories.forEach(bridge.addBridgedAccessory.bind(bridge));

    bridge.publish({
        username: config.username,
        port: config.port,
        pincode: config.pincode,
        category: Accessory.Categories.OTHER
    });
};
