/*
 *  Connect to a Denon AVR at a named host
 */

var iotdb = require("iotdb");

var DenonAVRBridge = require('../bridge').Bridge;

wrapper = iotdb.bridge_wrapper(new DenonAVRBridge({
    mdns: true
}));
wrapper.on('discovered', function(bridge) {
    console.log("+ discovered\n ", bridge.meta());
    bridge.push({
        volume: 0.2,
        band: "DVD",
    });
})
wrapper.on('state', function(bridge, state) {
    console.log("+ state", state);
})
wrapper.on('meta', function(bridge) {
    console.log("+ meta", bridge.meta());
})
wrapper.on('disconnected', function(bridge) {
    console.log("+ disconnected", bridge.meta());
})
