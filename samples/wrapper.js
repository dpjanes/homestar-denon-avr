/*
 *  Use a "bridge_wrapper", which handles all injections
 */

var homestar = require("homestar");
var _ = homestar._;

var ModelBinding = require('../DenonAVR');

wrapper = _.bridge_wrapper(ModelBinding.binding, { mdns: true });
wrapper.on('bridge', function(bridge) {
    console.log("+ discovered\n ", _.ld.compact(bridge.meta()));
    bridge.push({
        volume: 0.2,
        band: "DVD",
    });
})
wrapper.on('state', function(bridge, state) {
    console.log("+ state", state);
})
wrapper.on('meta', function(bridge) {
    console.log("+ meta", _.ld.compact(bridge.meta()));
})
wrapper.on('disconnected', function(bridge) {
    console.log("+ disconnected", _.ld.compact(bridge.meta())_;
})
