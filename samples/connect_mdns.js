/*
 *  Connect to a Denon AVR at a named host
 */

var DenonAVRBridge = require('../bridge').Bridge;

var denon = new DenonAVRBridge({
    mdns: true,
});
denon.discovered = function(bridge) {
    console.log("got 'en", bridge.meta());
    bridge.connect();
    bridge.push({
        volume: 50,
    });
};
denon.discover();
