/*
 *  DenonAVR.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-06
 */

var homestar = require("homestar")

exports.Model = homestar.make_model('DenonAVR')
    .name("Denon AVR")
    .description("Denon Audio/Visual Receivers")
    .io("on", "on-value", homestar.boolean.on)
    .io("volume", "volume-value", homestar.percent.volume)
    .io("band", "band-value", homestar.string.band)
    .make()
    ;

exports.binding = {
    bridge: require('./DenonAVRBridge').Bridge,
    model: exports.Model,
};
