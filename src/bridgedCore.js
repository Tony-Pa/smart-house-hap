var path = require('path');
var storage = require('node-persist');
var uuid = require('hap-nodejs').uuid;
var Bridge = require('hap-nodejs').Bridge;
var Accessory = require('hap-nodejs').Accessory;
var accessoryLoader = require('hap-nodejs').AccessoryLoader;
var config = require('./config/main');

module.exports = function () {
    // Initialize our storage system
    storage.initSync();

    var bridge = new Bridge('Smart House Accessories', uuid.generate('Smart House Node Bridge'));

    bridge.on('identify', function (paired, callback) {
        console.log('Node Bridge identify');
        callback();
    });

    var dir = path.join(__dirname, 'accessories');
    var accessories = accessoryLoader.loadDirectory(dir);

    accessories.forEach(bridge.addBridgedAccessory.bind(bridge));

    bridge.publish({
        username: config.username,
        port: config.port,
        pincode: config.pincode,
        category: Accessory.Categories.OTHER
    });
};
