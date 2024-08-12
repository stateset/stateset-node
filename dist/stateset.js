"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = require("events");
const https = __importStar(require("https"));
const HttpClient_1 = require("./HttpClient");
const utils_1 = __importDefault(require("./utils"));
const resources = __importStar(require("./resources"));
class Stateset extends events_1.EventEmitter {
    constructor(token) {
        super();
        this._api = {
            host: Stateset.DEFAULT_HOST,
            port: Stateset.DEFAULT_PORT,
            protocol: 'https',
            basePath: Stateset.DEFAULT_BASE_PATH,
            version: Stateset.DEFAULT_API_VERSION,
            timeout: Stateset.DEFAULT_TIMEOUT,
            maxNetworkRetries: Stateset.DEFAULT_MAX_NETWORK_RETRIES,
            httpClient: Stateset.createDefaultHttpClient(),
        };
        this._emitter = new events_1.EventEmitter();
        this._enableTelemetry = true;
        this._props = {};
        this._prepResources();
        this.setToken(token);
        this._setApiField('httpClient', new HttpClient_1.HttpClient(this));
    }
    setHost(host, port, protocol) {
        this._setApiField('host', host);
        if (port) {
            this.setPort(port);
        }
        if (protocol) {
            this.setProtocol(protocol);
        }
    }
    setProtocol(protocol) {
        this._setApiField('protocol', protocol.toLowerCase());
    }
    setPort(port) {
        this._setApiField('port', port);
    }
    setApiVersion(version) {
        if (version) {
            this._setApiField('version', version);
        }
    }
    setToken(token) {
        if (token) {
            this._setApiField('auth', `Bearer ${token}`);
        }
    }
    setTimeout(timeout) {
        this._setApiField('timeout', timeout == null ? Stateset.DEFAULT_TIMEOUT : timeout);
    }
    setMaxNetworkRetries(maxNetworkRetries) {
        this._setApiField('maxNetworkRetries', maxNetworkRetries);
    }
    setEnableTelemetry(enableTelemetry) {
        this._enableTelemetry = enableTelemetry;
    }
    getTelemetryEnabled() {
        return this._enableTelemetry;
    }
    getApiField(key) {
        return this._api[key];
    }
    setApiField(key, value) {
        this._api[key] = value;
    }
    getConstant(c) {
        return Stateset[c];
    }
    getClientUserAgent(cb) {
        if (Stateset.USER_AGENT_SERIALIZED) {
            return cb(Stateset.USER_AGENT_SERIALIZED);
        }
        this.getClientUserAgentSeeded(Stateset.USER_AGENT, (cua) => {
            Stateset.USER_AGENT_SERIALIZED = cua;
            cb(Stateset.USER_AGENT_SERIALIZED);
        });
    }
    getClientUserAgentSeeded(seed, cb) {
        utils_1.default.safeExec('uname -a', (err, uname) => {
            const userAgent = {};
            for (const field in seed) {
                userAgent[field] = encodeURIComponent(seed[field]);
            }
            userAgent.uname = encodeURIComponent(uname || 'UNKNOWN');
            cb(JSON.stringify(userAgent));
        });
    }
    _setApiField(key, value) {
        this._api[key] = value;
    }
    _prepResources() {
        for (const name in resources) {
            this[name.toLowerCase()] = new resources[name](this);
        }
    }
    static createDefaultHttpClient() {
        const agent = new https.Agent({ keepAlive: true });
        return (req, cb) => {
            const options = {
                host: req.getHeader('host'),
                port: req.getHeader('port'),
                path: req.path,
                method: req.method,
                headers: req.getHeaders(),
                ciphers: 'DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5',
                agent: agent,
            };
            const req_ = https.request(options);
            req_.on('response', cb);
            req_.on('error', (error) => {
                if (req._isAborted)
                    return;
                cb(error);
            });
            req_.on('socket', (socket) => {
                socket.on('error', (error) => {
                    if (req._isAborted)
                        return;
                    cb(error);
                });
            });
            req_.end(req.getBody());
        };
    }
}
Stateset.DEFAULT_HOST = 'api.stateset.com';
Stateset.DEFAULT_PORT = '443';
Stateset.DEFAULT_BASE_PATH = '/v1/';
Stateset.DEFAULT_API_VERSION = null;
Stateset.DEFAULT_TIMEOUT = 80000;
Stateset.MAX_NETWORK_RETRY_DELAY_SEC = 2;
Stateset.INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;
Stateset.DEFAULT_MAX_NETWORK_RETRIES = 0;
Stateset.PACKAGE_VERSION = '0.0.1';
Stateset.USER_AGENT = {
    bindings_version: Stateset.PACKAGE_VERSION,
    lang: 'node',
    lang_version: process.version,
    platform: process.platform,
    publisher: 'stateset',
    uname: null,
};
Stateset.USER_AGENT_SERIALIZED = null;
module.exports = Stateset;
