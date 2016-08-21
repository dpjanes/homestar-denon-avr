/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

const iotdb = require('iotdb');
iotdb.use("homestar-denon-avr");

const things = iotdb.connect('DenonAVR');
things.set(":volume", 0.18);
things.set(":band", "iot-purpose:band.tv");
