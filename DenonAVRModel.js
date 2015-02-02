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
    .io("on", "on-value", iotdb.boolean.on)
    .io("volume", "volume-value", iotdb.percent.volume)
    .io("band", "band-value", iotdb.string.band)
    .make()
    ;
