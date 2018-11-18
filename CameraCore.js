var storage = require('node-persist');
var uuid = require('hap-nodejs').uuid;
var Accessory = require('hap-nodejs').Accessory;
var Camera = require('./src/Camera').Camera;

console.log("HAP-NodeJS Camera starting...");

// Initialize our storage system
storage.initSync();

var cameraConfig = {
    "name": "Camera Name",
    "videoConfig": {
      "source": "-re -i rtsp://admin:Antoha-89@192.168.88.22:554/Streaming/Channels/101",
      "stillImageSource": "-i http://192.168.88.22/Streaming/Channels/101/picture",
      "maxStreams": 1,
      "maxWidth": 1920,
      "maxHeight": 1080,
      "maxFPS": 30,
      "packetSize": 188,
    }
};

// Start by creating our Bridge which will host all loaded Accessories
var cameraAccessory = new Accessory('Node Camera', uuid.generate("Node Camera"));

var cameraSource = new Camera(cameraConfig);

cameraAccessory.configureCameraSource(cameraSource);

cameraAccessory.on('identify', function(paired, callback) {
  console.log("Node Camera identify");
  callback(); // success
});

// Publish the camera on the local network.
cameraAccessory.publish({
  username: "EC:22:3D:D3:CE:CE",
  port: 51062,
  pincode: "031-45-154",
  category: Accessory.Categories.CAMERA
}, true);
