/*
 *  NOTE: prefer to do the way 'model.js' works
 *  Connect to a Denon AVR by searching MDNS/Bonjour
 */

"use strict";

var DenonAVRBridge = require('../DenonAVRBridge').Bridge;

var denon = new DenonAVRBridge({
    mdns: true,
});
denon.discovered = function (bridge) {
    console.log("+ got one", bridge.meta());
    bridge.pulled = function (state) {
        console.log("+ state-change", state);
    };
    bridge.connect({});
    bridge.push({
        volume: 0.5,
    });
};
denon.discover();
