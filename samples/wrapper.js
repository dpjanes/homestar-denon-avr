/*
 *  Use a "bridge_wrapper", which handles all injections
 */

var iotdb = require("iotdb");

var DenonAVR = require('../DenonAVR');

wrapper = iotdb.bridge_wrapper(DenonAVR.binding, { mdns: true });
wrapper.on('bridge', function(bridge) {
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
