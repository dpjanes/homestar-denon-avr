/*
 *  How to use this module stand-alone
 */
try {
    var module = require('homestar-denon-avr')
} catch (x) {
    var module = require('../index')
}

var _ = module.homestar._;

wrapper = module.wrap("DenonAVR", { mdns: true });
wrapper.on('model', function(model) {
    model.on("state", function(model) {
        console.log("+ state\n ", model.state());
    });
    model.on("meta", function(model) {
        console.log("+ meta\n ", _.ld.compact(model.meta().state()));
    });
    model.set('volume', 0.25);
    
    console.log("+ discovered\n ", _.ld.compact(model.meta().state()), "\n ", model.thing_id());
});
