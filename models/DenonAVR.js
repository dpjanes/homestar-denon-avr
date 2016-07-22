/*
 *  DenonAVR.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-06
 */

exports.binding = {
    bridge: require('../DenonAVRBridge').Bridge,
    model: require('./denon-avr.json'),
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
