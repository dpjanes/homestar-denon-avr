/*
 *  NOTE: prefer to do the way 'model.js' works
 *  Connect to a Denon AVR by searching MDNS/Bonjour
 */

"use strict";

var DenonAVRBridge = require('../DenonAVRBridge').Bridge;

var denon = new DenonAVRBridge();
denon.discovered = function (bridge) {
    console.log("+ got one", bridge.meta());
    bridge.pulled = function (state) {
        console.log("+ state-change", state);
    };
    bridge.connect({});
    bridge.push({
        on: true,
        volume: 0.5,
        band: 'AUX1',
        soundmode: 'MCH STEREO'
    }, function() {});
};
denon.discover();
