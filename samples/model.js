/*
 *  How to use this module stand-alone
 */

"use strict";

const iotdb = require("iotdb")
const _ = iotdb._;

const homestar_denon_avr = require('homestar-denon-avr');

const wrapper = _.bridge.wrap("DenonAVR", homestar_denon_avr.bindings, {
    mdns: true
});
wrapper.on('thing', function (model) {
    model.on("state", function (model) {
        console.log("+ state\n ", model.state("istate"));
    });
    model.on("meta", function (model) {
        console.log("+ meta\n ", model.thing_id(), "\n ", model.state("meta"));
    });
    model.set('volume', 0.25);

    console.log("+ discovered\n ", model.thing_id(), "\n ", model.state("meta"));
});
