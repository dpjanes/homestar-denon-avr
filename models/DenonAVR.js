/*
 *  DenonAVR.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-06
 */

var iotdb = require("iotdb");
var _ = iotdb._;

exports.Model = iotdb.make_model('DenonAVR')
    .name("Denon AVR")
    .description("Denon Audio/Visual Receivers")
    .io("on", iotdb.boolean.on)
    .io("volume", iotdb.number.unit.volume)
    .io("band", iotdb.string.band)
    .io("band",
        iotdb
        .make_string(":band")
        .enumeration(_.ld.expand([
            "iot-purpose:band.aux",
            "iot-purpose:band.bluray",
            "iot-purpose:band.cable",
            "iot-purpose:band.cd",
            "iot-purpose:band.dvd",
            "iot-purpose:band.dvr",
            "iot-purpose:band.game",
            "iot-purpose:band.game#1",
            "iot-purpose:band.game#2",
            "iot-purpose:band.phono",
            "iot-purpose:band.radio.hd",
            "iot-purpose:band.radio.internet",
            "iot-purpose:band.radio.tuner",
            "iot-purpose:band.satellite",
            "iot-purpose:band.service.flickr",
            "iot-purpose:band.service.lastfm",
            "iot-purpose:band.service.napster",
            "iot-purpose:band.service.pandora",
            "iot-purpose:band.service.rhapsody",
            "iot-purpose:band.tv",
            "iot-purpose:band.usb",
            "iot-purpose:band.vendor.dock",
            "iot-purpose:band.vendor.favorites",
            "iot-purpose:band.vendor.ipod",
            "iot-purpose:band.vendor.media-player",
        ]))
    )
    .make();

exports.binding = {
    bridge: require('../DenonAVRBridge').Bridge,
    model: exports.Model,
    mapping: {
        band: {
            "iot-purpose:band.phono": "PHONO",
            "iot-purpose:band.cd": "CD",
            "iot-purpose:band.dvd": "DVD",
            "iot-purpose:band.bluray": "BD",
            "iot-purpose:band.tv": "TV",
            "iot-purpose:band.satellite": "SAT/CBL",
            "iot-purpose:band.cable": "SAT/CBL",
            "iot-purpose:band.dvr": "DVR",
            "iot-purpose:band.game": "GAME",
            "iot-purpose:band.game#1": "GAME",
            "iot-purpose:band.game#2": "GAME2",
            "iot-purpose:band.aux": "V.AUX",
            "iot-purpose:band.vendor.dock": "DOCK",
            "iot-purpose:band.vendor.ipod": "IPOD",
            "iot-purpose:band.vendor.favorites": "FAVORITES",
            "iot-purpose:band.radio.tuner": "TUNER",
            "iot-purpose:band.radio.hd": "radio.hd",
            "iot-purpose:band.vendor.media-player": "MPLAY",
            "iot-purpose:band.service.rhapsody": "RHAPSODY",
            "iot-purpose:band.service.napster": "NAPSTER",
            "iot-purpose:band.service.pandora": "PANDORA",
            "iot-purpose:band.service.lastfm": "LASTFM",
            "iot-purpose:band.service.flickr": "FLICKR",
            "iot-purpose:band.radio.internet": "IRADIO",
            "iot-purpose:band.usb": "USB",
        }
    }
};
