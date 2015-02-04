# homestar-denon-avr

Connect and control Denon AVR(s) with HomeStar and IOTDB.

See <a href="samples/">the samples</a> for details how to add to your project.

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

