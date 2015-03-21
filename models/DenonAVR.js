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
                "iot-attribute:band.aux",
                "iot-attribute:band.bluray",
                "iot-attribute:band.cable",
                "iot-attribute:band.cd",
                "iot-attribute:band.dvd",
                "iot-attribute:band.dvr",
                "iot-attribute:band.game",
                "iot-attribute:band.game#1",
                "iot-attribute:band.game#2",
                "iot-attribute:band.phono",
                "iot-attribute:band.radio.hd",
                "iot-attribute:band.radio.internet",
                "iot-attribute:band.radio.tuner",
                "iot-attribute:band.satellite",
                "iot-attribute:band.streaming.flickr",
                "iot-attribute:band.streaming.lastfm",
                "iot-attribute:band.streaming.napster",
                "iot-attribute:band.streaming.pandora",
                "iot-attribute:band.streaming.rhapsody",
                "iot-attribute:band.tv",
                "iot-attribute:band.usb",
                "iot-attribute:band.vendor.dock",
                "iot-attribute:band.vendor.favorites",
                "iot-attribute:band.vendor.ipod",
                "iot-attribute:band.vendor.media-player",
            ]))
    )
    .make();

exports.binding = {
    bridge: require('../DenonAVRBridge').Bridge,
    model: exports.Model,
    mapping: {
        band: {
            "iot-attribute:band.phono": "PHONO",
            "iot-attribute:band.cd": "CD",
            "iot-attribute:band.dvd": "DVD",
            "iot-attribute:band.bluray": "BD",
            "iot-attribute:band.tv": "TV",
            "iot-attribute:band.satellite": "SAT/CBL",
            "iot-attribute:band.cable": "SAT/CBL",
            "iot-attribute:band.dvr": "DVR",
            "iot-attribute:band.game": "GAME",
            "iot-attribute:band.game#1": "GAME",
            "iot-attribute:band.game#2": "GAME2",
            "iot-attribute:band.aux": "V.AUX",
            "iot-attribute:band.vendor.dock": "DOCK",
            "iot-attribute:band.vendor.ipod": "IPOD",
            "iot-attribute:band.vendor.favorites": "FAVORITES",
            "iot-attribute:band.radio.tuner": "TUNER",
            "iot-attribute:band.radio.hd": "radio.hd",
            "iot-attribute:band.vendor.media-player": "MPLAY",
            "iot-attribute:band.streaming.rhapsody": "RHAPSODY",
            "iot-attribute:band.streaming.napster": "NAPSTER",
            "iot-attribute:band.streaming.pandora": "PANDORA",
            "iot-attribute:band.streaming.lastfm": "LASTFM",
            "iot-attribute:band.streaming.flickr": "FLICKR",
            "iot-attribute:band.radio.internet": "IRADIO",
            "iot-attribute:band.usb": "USB",
        }
    }
};
