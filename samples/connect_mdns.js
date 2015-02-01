/*
 *  Connect to a Denon AVR by searching MDNS/Bonjour
 */

var DenonAVRBridge = require('../bridge').Bridge;

var denon = new DenonAVRBridge({
    mdns: true,
});
denon.discovered = function(bridge) {
    console.log("+ got one", bridge.meta());
    bridge.pulled = function(state) {
        console.log("+ state-change", state);
    };
    bridge.connect();
    bridge.push({
        volume: 50,
    });
};
denon.discover();
