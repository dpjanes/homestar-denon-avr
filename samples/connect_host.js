/*
 *  Connect to a Denon AVR at a named host
 */

var DenonAVRBridge = require('../DenonAVRBridge').Bridge;

var denon = new DenonAVRBridge({
    host: "192.168.0.19", 
});
denon.discovered = function(bridge) {
    console.log("+ got one", bridge.meta());
    bridge.pulled = function(state) {
        console.log("+ state-change", state);
    };
    bridge.connect();
    bridge.push({
        volume: .5,
    });
};
denon.discover();
