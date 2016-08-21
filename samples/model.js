/*
 *  How to use this module stand-alone
 */

"use strict";

try {
    var m = require('homestar-denon-avr');
} catch (x) {
    var m = require('../index');
}

const _ = m.iotdb._;

const wrapper = m.wrap("DenonAVR", {
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
