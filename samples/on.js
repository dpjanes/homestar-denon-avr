/*
 *  NOTE: prefer to do the way 'model.js' works
 *  Use a "bridge_wrapper", which handles all injections
 */

"use strict";

const iotdb = require("iotdb");
const _ = iotdb._;

const ModelBinding = require('../models/denon-avr');

const wrapper = _.bridge.make(ModelBinding.binding, {
    mdns: true
});
wrapper.on('bridge', function (bridge) {
    console.log("+ discovered\n ", _.ld.compact(bridge.meta()));
    bridge.push({
        volume: 0.35,
    }, function() {});
});
wrapper.on('state', function (bridge, state) {
    console.log("+ state", state);
});
wrapper.on('meta', function (bridge) {
    console.log("+ meta", _.ld.compact(bridge.meta()));
});
wrapper.on('disconnected', function (bridge) {
    console.log("+ disconnected", _.ld.compact(bridge.meta()));
});
