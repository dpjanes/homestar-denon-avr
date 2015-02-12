/*
 *  Use a Model to manipulate semantically
 */

var homestar = require("homestar");
var _ = homestar._;

var ModelBinding = require('../DenonAVR');

wrapper = _.bridge_wrapper(ModelBinding.binding, { mdns: true });
wrapper.on('model', function(model) {
    model.on_change(function(model) {
        console.log("+ state\n ", model.state());
    });
    model.on_meta(function(model) {
        console.log("+ meta\n ", _.ld(model.meta().state()));
    });
    model.set('volume', 0.25);
    
    console.log("+ discovered\n ", _.ld(model.meta().state()), "\n ", model.thing_id());
});
