/*
 *  DenonAVR.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-01-31
 *
 *  This is a an example of a Bridge, which is a massively 
 *  simplified way of writing drivers
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

"use struct";

var iotdb = require('iotdb')
var _ = iotdb.helpers;
var net = require('net');

var mdns = require('mdns');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'DenonAVRBridge',
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
var DenonAVRBridge = function(native) {
    var self = this;

    self.native = _.defaults(native, {
        name: "Denon AVR",
        poll: 30,
        retry: 15,
        port: 23,
        host: null,
        mdns: true,
        client: null,
    });
};

/* --- lifecycle --- */

/**
 *  EXEMPLAR. 
 *  Discover one or more Things.
 *  <ul>
 *  <li>look for Things (using <code>self.bridge</code> data to initialize)
 *  <li>find / create a <code>native</code> that does the talking
 *  <li>create an DenonAVRBridge(native)
 *  <li>call <code>self.discovered(bridge)</code> with it
 */
DenonAVRBridge.prototype.discover = function() {
    var self = this;
    
    if (self.native.host) {
        self._discover_host(self.native);
    } else if (self.native.mdns) {
        var browser = mdns.createBrowser(mdns.tcp('http'));
        browser.on('serviceUp', function(service) {
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
            }, self.native));
        });
        browser.start();
    }
};

/**
 *  INTERNAL EXEMPLAR
 *  Connect to a particular host
 */
DenonAVRBridge.prototype._discover_host = function(discoverd) {
    var self = this;
    var client = null;
    var is_discovered = false;
    var is_probed_and_discarded = false;
    var interval = null;

    var _destroy = function() {
        if (client) {
            client.removeListener('data', _on_data);
            client.removeListener('end', _on_end);
            client.removeListener('error', _on_error);
            client.destroy();
        }

        client = null;
        is_discovered = false;
    };

    var _not_a_denon = function() {
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

    var _on_connect = function() {
        logger.info({
            method: "_discover_host/_on_connect",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
        }, "connected - now checking MV command");

        client.write("MV?\r");
    };

    var _on_error = function(error) {
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

    var _on_data = function(data) {
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

        var initd = _.smart_extend({
            client: client,
        }, self.native);
        var bridge = new DenonAVRBridge(initd);

        self.discovered(bridge);
        is_discovered = true;
    };

    var _on_end = function() {
        logger.info({
            method: "_discover_host/_on_end",
            unique_id: self.unique_id,
            host: discoverd.host,
            port: discoverd.port,
        }, "client disconnected");

        client = null;
        is_discovered = false;
    };

    var _discover = function() {
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

            self._destroy();
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

    if (self.native.retry > 0) {
        interval = setInterval(function() {
            _discover();
        }, self.native.retry * 1000);
    }

    _discover();
};

/**
 *  INSTANCE
 *  This is called when the Bridge is no longer needed. When
 */
DenonAVRBridge.prototype.connect = function() {
    var self = this;
    if (!self.native.client) {
        return;
    }

    self.pull();

    if (self.native.poll) {
        setInterval(function() {
            self.pull();
        }, self.native.poll * 1000);
    }
};

/**
 *  INSTANCE and EXEMPLAR (during shutdown). 
 *  This is called when the Bridge is no longer needed. When
 */
DenonAVRBridge.prototype.disconnect = function() {
    var self = this;
    if (!self.native || !self.native.client) {
        return;
    }
};

/* --- data --- */

/**
 *  INSTANCE.
 *  Send data to whatever you're taking to.
 */
DenonAVRBridge.prototype.push = function(pushd) {
    var self = this;
    if (!self.native.client) {
        return;
    }

};

/**
 *  INSTANCE.
 *  Pull data from whatever we're talking to. You don't
 *  have to implement this if it doesn't make sense
 */
DenonAVRBridge.prototype.pull = function() {
    var self = this;
    if (!self.native.client) {
        return;
    }

    logger.info({
        method: "pull",
        unique_id: self.unique_id,
        host: self.native.host,
        port: self.native.port,
    }, "polling Denon AVR for current state");
};

/* --- state --- */

/**
 *  INSTANCE.
 *  Return the identify of this thing: basically
 *  a dictionary of what uniquely identifies this,
 *  based <code>self.native</code>.
 *  <p>
 *  There <b>must</b> be something in the dictionary!
 */
DenonAVRBridge.prototype.identity = function() {
    return {
        name: self.native.name,
    };
};

/**
 *  INSTANCE.
 *  Return the metadata - compact form can be used.
 *  <p>
 *  Really really useful things are:
 *  <ul>
 *  <li><code>iot:name</code>
 *  <li><code>iot:number</code>
 *  <li><code>schema:manufacturer</code>
 *  <li><code>schema:model</code>
 */
DenonAVRBridge.prototype.meta = function() {
    return {
        "iot:name": self.native.name || "DenonAVR",
        "iot:number": 1,
    };
};

/**
 *  INSTANCE.
 *  Return True if this is reachable. You 
 *  do not need to worry about connect / disconnect /
 *  shutdown states, they will be always checked first.
 */
DenonAVRBridge.prototype.reachable = function() {
    return this.native.client !== null;
};

/**
 *  INSTANCE.
 *  Return True if this is configured. Things
 *  that are not configured are always not reachable.
 *  If not defined, "true" is returned
 */
DenonAVRBridge.prototype.configured = function() {
    return true;
};

/* --- injected: THIS CODE WILL BE REMOVED AT RUNTIME, DO NOT MODIFY  --- */
DenonAVRBridge.prototype.discovered = function(bridge) {
    throw new Error("DenonAVRBridge.discovered not implemented");
};

DenonAVRBridge.prototype.pulled = function(pulld) {
    throw new Error("DenonAVRBridge.pulled not implemented");
};

DenonAVRBridge.prototype.connected = function() {
    throw new Error("DenonAVRBridge.connected not implemented");
};

DenonAVRBridge.prototype.disconnected = function() {
    throw new Error("DenonAVRBridge.disconnected not implemented");
};

/*
 *  API
 */
exports.Bridge = DenonAVRBridge;
