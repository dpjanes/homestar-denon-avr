/*
 *  DenonAVR.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-01-31
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var net = require('net');
try {
    var mdns = require('mdns');
} catch (x) {
    mdns = null;
}
var amdns = require('avahi-mdns-kludge');

var logger = bunyan.createLogger({
    name: 'homestar-denon-avr',
    module: 'DenonAVRBridge',
    level: 'warn'
});

/**
 *  EXEMPLAR and INSTANCE
 *  <p>
 *  No subclassing needed! The following functions are
 *  injected _after_ this is created, and before .discover and .connect
 *  <ul>
 *  <li><code>discovered</code> - tell IOTDB that we're talking to a new Thing
 *  <li><code>pulled</code> - got new data
 *  <li><code>connected</code> - this is connected to a Thing
 *  <li><code>disconnnected</code> - this has been disconnected from a Thing
 *  </ul>
 */
var DenonAVRBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/DenonAVRBridge/initd"),
        {
            name: "Denon AVR",
            poll: 30,
            retry: 15,
            port: 23,
            host: null,
            mdns: true,
        }
    );
    self.native = native;
    self.istated = {};
    self.max_volume = 98;

    self.deferd = null;
    self.defer_time = 0;
    self.defer_timer_id = null;
};

/* --- lifecycle --- */

/**
 *  EXEMPLAR.
 *  Discover one or more Things.
 *  <ul>
 *  <li>look for Things (using <code>self.bridge</code> data to initialize)
 *  <li>find / create a <code>paramd</code> that does the talking
 *  <li>create an DenonAVRBridge(paramd)
 *  <li>call <code>self.discovered(bridge)</code> with it
 */
DenonAVRBridge.prototype.discover = function () {
    var self = this;

    if (self.initd.host) {
        self._discover_host(self.initd);
    } else if (self.initd.mdns) {
        if (mdns) {
            self._discover_mdns();
        } else if (amdns) {
            self._discover_amdns();
        }

    }
};

DenonAVRBridge.prototype._discover_mdns = function () {
    var self = this;

    var browser = mdns.createBrowser(mdns.tcp('http'));
    browser.on('error', function (error) {
        logger.error({
            method: "discover",
            unique_id: self.unique_id,
            error: error,
            cause: "likely network related - ignoring",
        }, "error");

        if ((error.code === -3008) && mdns && amdns) {
            mdns = null;

            logger.warn("switching to avahi-mdns-kludge");
            browser.stop();

            self._discover_amdns();

        }
    });
    browser.on('serviceUp', function (service) {
        if (service.port !== 80) {
            return;
        } else if (!service.addresses) {
            return;
        } else if (service.addresses.length === 0) {
            return;
        }

        self._discover_host(_.defaults({
            host: service.addresses[0],
            name: service.name,
            probe: true,
        }, self.initd));
    });
    browser.start();
};

DenonAVRBridge.prototype._discover_amdns = function () {
    var self = this;

    if (!amdns) {
        return;
    }

    amdns.browser(function(error, d) {
        if (error) {
            return;
        }

        if (!d.deviceid) {
            return;
        }

        if (!d.deviceid.match(/^00:05:CD:/)) {
            return;
        }

        self._discover_host(_.defaults({
            host: d.address,
            name: d.hostname,
            probe: false,
        }, self.initd));

    });
};

/**
 *  INTERNAL EXEMPLAR
 *  Connect to a particular host
 */
DenonAVRBridge.prototype._discover_host = function (discoverd) {
    var self = this;
    var client = null;
    var is_discovered = false;
    var is_probed_and_discarded = false;
    var interval = null;

    var _destroy = function () {
        if (client) {
            client.removeListener('data', _on_data);
            client.removeListener('end', _on_end);
            client.removeListener('error', _on_error);
            client.destroy();
        }

        client = null;
        is_discovered = false;
    };

    var _not_a_denon = function () {
        logger.info({
            method: "_discover_host/_not_a_denon",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
        }, "not a Denon");

        is_probed_and_discarded = true;
        _destroy();

        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };

    var _on_connect = function () {
        logger.info({
            method: "_discover_host/_on_connect",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
        }, "connected - now checking MV command");

        client.write("MV?\r");
    };

    var _on_error = function (error) {
        logger.error({
            method: "_discover_host/_on_error",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
            error: error,
        }, "error");

        if (discoverd.probe && !is_discovered) {
            _not_a_denon();
        }

        _destroy();

    };

    var _on_data = function (data) {
        if (is_discovered) {
            return;
        }

        var data$ = data.toString();
        if (data$.indexOf('MV') === -1) {
            if (discoverd.probe) {
                _not_a_denon();
            }
            return;
        }

        logger.info({
            method: "_discover_host/_on_data",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
        }, "checks out - will use this device");

        var bridge = new DenonAVRBridge(discoverd, client);

        self.discovered(bridge);
        is_discovered = true;
    };

    var _on_end = function () {
        logger.info({
            method: "_discover_host/_on_end",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
        }, "client disconnected");

        client = null;
        is_discovered = false;
    };

    var _discover = function () {
        if (client) {
            if (is_discovered) {
                return;
            }

            logger.info({
                method: "_discover_host/_on_error",
                unique_id: self.unique_id,
                host: discoverd.host,
                port: discoverd.port,
            }, "throwing away a client that didn't return MV and will try again");

            _destroy();
        }

        logger.info({
            method: "_discover_host/_discover",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
        }, "looking for Denon");

        client = net.connect(discoverd.port, discoverd.host, _on_connect);
        client.on('error', _on_error);
        client.on('data', _on_data);
        client.on('end', _on_end);
    };

    if (self.initd.retry > 0) {
        interval = setInterval(function () {
            _discover();
        }, self.initd.retry * 1000);
    }

    _discover();
};

/**
 *  INSTANCE
 *  Call when ready to be used as an instance
 */
DenonAVRBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._setup_events();
    self._setup_polling();

    self.pull();
};

DenonAVRBridge.prototype._setup_events = function () {
    var self = this;

    var _on_data = function (data) {
        var parts = data.toString().split('\r');
        for (var pi in parts) {
            self._received(parts[pi]);
        }
    };

    var _on_error = function (error) {
        _disconnected();

        logger.info({
            method: "connect/_on_error",
            unique_id: self.unique_id,
            host: self.initd.host,
            port: self.initd.port,
            error: error,
        }, "called");
    };

    var _on_end = function () {
        _disconnected();

        logger.info({
            method: "connect/_on_end",
            unique_id: self.unique_id,
            host: self.initd.host,
            port: self.initd.port,
        }, "called");
    };

    var _disconnected = function () {
        if (!self.native) {
            return;
        }

        self.native.removeListener('data', _on_data);
        self.native.removeListener('end', _on_end);
        self.native.removeListener('error', _on_error);
        self.native = null;

        // disconnection is a metadata change
        self.pulled();
    };

    self.native.on('data', _on_data);
    self.native.on('end', _on_end);
    self.native.on('error', _on_error);

};

DenonAVRBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

DenonAVRBridge.prototype._received = function (message) {
    var self = this;
    if (!message.length) {
        return;
    }

    message = message.replace(/^(SI|PW|DC|SV|MS|MV(?=\d))/, "$1 ");
    var parts = message.split(" ", 2);
    var key = parts[0];
    var value = parts[1];

    if (key === "SI") {
        key = "band";
    } else if (key === "MS") {
        key = "sound_mode";
        value = message.substring(3);
    } else if (key === "MV") {
        key = "volume";
        value = parseInt(value);
        if (value >= 100) {
            value = value / 10;
        }
        value = value / self.max_volume;
        value = Math.round(value * 1000);
        value = value / 1000.0;
    } else if (key === "PW") {
        key = "on";
        if (value === "ON") {
            value = true;
        } else {
            value = false;
        }
    } else if (key === "MVMAX") {
        self.max_volume = parseInt(value);
        return;
    } else {
        return;
    }

    if (self.istated[key] === value) {
        return;
    }

    self.istated[key] = value;
    self.pulled(self.istated);

    // if just turned on, send deferred data (if not a defer timer)
    if ((key === "on") && self.deferd && !self.defer_timer_id) {
        var deferd = self.deferd;
        self.deferd = null;
        self.push(deferd);
    }
};

/**
 *  INSTANCE and EXEMPLAR (during shutdown).
 *  This is called when the Bridge is no longer needed. When
 */
DenonAVRBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.initd || !self.native) {
        return;
    }

    self.native = null;
    self.pulled();
};

/* --- data --- */

/**
 *  INSTANCE.
 *  Send data to whatever you're taking to.
 */
DenonAVRBridge.prototype.push = function (pushd) {
    var self = this;
    if (!self.native) {
        return;
    }

    // if we don't know whether we are on or off, defer until later 
    if ((self.istated.on === undefined) || self.defer_timer_id) {
        self.deferd = _.defaults({}, pushd, self.deferd);
        return;
    }

    // if turning off, ignore everything else 
    if (pushd.on === false) {
        if (self.istated.on === false) {
            return;
        }

        self.native.write("\rPWSTANDBY\r");
        return;
    }

    // all other commands assume that we are turning on
    // if we are not on, we defer until that is done 
    if (!self.istated.on) {
        self.native.write("\rPWON\r");

        self.deferd = _.defaults({}, pushd, self.deferd);
        self.defer_timer_id = setTimeout(function() {
            var deferd = self.deferd;

            self.deferd = null;
            self.defer_timer_id = null;

            self.push(deferd);
        }, 10 * 1000);
        return;
    }

    if (pushd.volume !== undefined) {
        var volume = Math.min(Math.max(0, Math.round(pushd.volume * self.max_volume)), self.max_volume);
        if (volume < 10) {
            self.native.write("\rMV0" + volume + "\r");
        } else {
            self.native.write("\rMV" + volume + "\r");
        }
    }

    if (pushd.band !== undefined) {
        self.native.write("\rSI" + pushd.band.toUpperCase() + "\r");
    }
    
    if (pushd.sound_mode !== undefined) {
        self.native.write("\rMS" + pushd.sound_mode.toUpperCase() + "\r");
    }

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        host: self.initd.host,
        port: self.initd.port,
        pushd: pushd,
    }, "pushed");
};

/**
 *  INSTANCE.
 *  Pull data from whatever we're talking to. You don't
 *  have to implement this if it doesn't make sense
 */
DenonAVRBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "pull",
        unique_id: self.unique_id,
        host: self.initd.host,
        port: self.initd.port,
    }, "polling Denon AVR for current state");

    self.native.write("MV?\rSI?\rPW?\rMU?\rMS?\n");
};

/* --- state --- */

/**
 *  INSTANCE.
 *  Return the metadata - compact form can be used.
 *  <p>
 *  Really really useful things are:
 *  <ul>
 *  <li><code>iot:thing</code> required - a unique ID
 *  <li><code>iot:device</code> suggested if linking multiple things together
 *  <li><code>schema:name</code>
 *  <li><code>iot:number</code>
 *  <li><code>schema:manufacturer</code>
 *  <li><code>schema:model</code>
 */
DenonAVRBridge.prototype.meta = function () {
    var self = this;

    return {
        "iot:thing": _.id.thing_urn.network_unique("DenonAVR", self.initd.name || "DenonAVR"),
        "schema:name": self.initd.name || "DenonAVR",
        "schema:manufacturer": "http://www.denon.com/",
    };
};

/**
 *  INSTANCE.
 *  Return True if this is reachable. You
 *  do not need to worry about connect / disconnect /
 *  shutdown states, they will be always checked first.
 */
DenonAVRBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  INSTANCE.
 *  Configure an express web page to configure this Bridge.
 *  Return the name of the Bridge, which may be
 *  listed and displayed to the user.
 */
DenonAVRBridge.prototype.configure = function (app) {};

/* --- injected: THIS CODE WILL BE REMOVED AT RUNTIME, DO NOT MODIFY  --- */
DenonAVRBridge.prototype.discovered = function (bridge) {
    throw new Error("DenonAVRBridge.discovered not implemented");
};

DenonAVRBridge.prototype.pulled = function (pulld) {
    throw new Error("DenonAVRBridge.pulled not implemented");
};

/*
 *  API
 */
exports.Bridge = DenonAVRBridge;
