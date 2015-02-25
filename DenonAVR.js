/*
 *  DenonAVR.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-06
 */

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('DenonAVR')
    .name("Denon AVR")
    .description("Denon Audio/Visual Receivers")
    .io("on", iotdb.boolean.on)
    .io("volume", iotdb.percent.volume)
    .io("band", iotdb.string.band)
    .make()
    ;

exports.binding = {
    bridge: require('./DenonAVRBridge').Bridge,
    model: exports.Model,
};
