var path = require('path');
var storage = require('node-persist');
var uuid = require('hap-nodejs').uuid;
var Bridge = require('hap-nodejs').Bridge;
var Accessory = require('hap-nodejs').Accessory;
var accessoryLoader = require('hap-nodejs').AccessoryLoader;

console.log("Starting HAP...");

var pincode = "031-45-154";

// Initialize our storage system
storage.initSync();

var bridge = new Bridge('Smart House Accessories', uuid.generate("Node Bridge"));

bridge.on('identify', function(paired, callback) {
    console.log("Node Bridge identify");
    callback();
});

var dir = path.join(__dirname, "accessories");
var accessories = accessoryLoader.loadDirectory(dir);

accessories.forEach(function(accessory) {
    bridge.addBridgedAccessory(accessory);
});

bridge.publish({
    username: "1A:11:BB:22:C3:4D",
    port: 51826,
    pincode: pincode,
    category: Accessory.Categories.OTHER
});

_printPincode(pincode);

function _printPincode(pc) {
    console.log("Scan this code with your HomeKit App on your iOS device to pair with HAP:");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
    console.log("\x1b[30;47m%s\x1b[0m", "      ┌────────────┐       ");
    console.log("\x1b[30;47m%s\x1b[0m", "      │ " + pc + " │       ");
    console.log("\x1b[30;47m%s\x1b[0m", "      └────────────┘       ");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
    console.log("\x1b[30;47m%s\x1b[0m", "                           ");
}
