# iotdb-bridge-denon-avr
Denon AVR Bridge for IOTDB

## About

This bridge will allow you to:

* set volume, band, and on (power)
* get same
* connect to Denon AVR using specified prot
* connect to Denon AVR by mDNS / Bounjour discovery

## Parameters

If you want to add more controls, it should be fairly
straight forward. See the <a href="docs">docs</a> folder.

### Push / controls

* <code>volume</code>: number between 0 and 1
* <code>band</code>: Denon AVR "Select Input" band (see below)
* <code>on</code>: true or false

### Pull / readings

* <code>volume</code>: number between 0 and 1
* <code>band</code>: Denon AVR "Select Input" band (see below)
* <code>on</code>: true or false

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

## About Bridges

This an an IOTDB "Bridge" which provides a standardized
way of managing and talking to Things. N.B. These can be
used in your project without too much of IOTDB seeping in.

See <a href="samples/connect_wrapper">samples/connect\_wrapper</a>
for how to do this.

