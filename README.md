# homestar-denon-avr

Connect and control Denon AVR(s) with HomeStar and IOTDB.

See <a href="samples/">the samples</a> for details how to add to your project,
particularly <code>model.js</code> and <code>iotdb.js</code>.

# Quick Start

Set the TV to channel 3 (see the examples for more! really!)

	$ npm install -g homestar ## with 'sudo' if error
	$ homestar setup
	$ homestar install homestar-denon-avr
	$ node
	>>> iotdb = require('iotdb')
	>>> iot = iotdb.iot()
	>>> things = iot.connect("DenonAVR")
	>>> things.set(":volume", 0.5)
    >>>

# Raspberry Pi

If this does not install, make sure to run this command

    sudo apt-get install libavahi-compat-libdnssd-dev avahi-utils

## About

This bridge will allow you to:

* set volume, band, sound mode, and on (power)
* get same
* connect to Denon AVR using specified host
* connect to Denon AVR by mDNS / Bounjour discovery (default)

## Parameters

If you want to add more controls, it should be fairly
straight forward. See the <a href="docs">docs</a> folder.

* <code>volume</code>: number between 0 and 1
* <code>band</code>: Denon AVR "Select Input" band (see below)
* <code>sound_mode</code>: Denon AVR Sound Mode (see below)
* <code>on</code>: true or false
  
e.g.

    {
        "volume": 0.18,
        "band": "MEDIA",
        "sound_mode": "MCH STEREO",
        "on": true
    }

### Bands

Not all Denon AVRs support all these bands. Future
versions of this bridge will support some sort of
standardized value like <code>iot-attribute:band.phono</code>, etc..

* PHONO
* CD
* TUNER
* DVD
* BD
* TV
* SAT/CBL
* DVR
* GAME
* GAME2
* V.AUX
* DOCK
* HDRADIO
* IPOD
* SI
* RHAPSODY
* NAPSTER
* PANDORA
* LASTFM
* FLICKR
* FAVORITES
* IRADIO
* SERVER
* USB/IPOD
* USB
* IPD
* IRP
* FVP

### Sound Modes

Depends on Denon AVR model. Examples of Sound Modes:

* DIRECT
* PURE DIRECT
* STEREO
* STANDARD
* DOLBY DIGITAL
* DTS SUROUND
* MCH STEREO
* ROCK ARENA
* JAZZ CLUB
* MONO MOVIE
* MATRIX
* VIDEO GAME
* VIRTUAL
