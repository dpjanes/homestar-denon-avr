/*
 *  Use a Model to manipulate semantically
 */

var iotdb = require("iotdb");

var DenonAVRBridge = require('../DenonAVRBridge').Bridge;
var DenonAVRModel = require('../DenonAVRModel').Model;

wrapper = iotdb.bridge_wrapper(DenonAVRModel.Binding, { mdns: true })
wrapper.on('model', function(model) {
    model.on_change(function(model) {
        console.log("+ state\n ", model.state());
    });
    model.on_meta(function(model) {
        console.log("+ meta\n ", model.meta().state());
    });
    model.set('volume', 0.25);
    
    console.log("+ discovered\n ", model.meta().state(), "\n ", model.thing_id());
});
