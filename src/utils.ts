'use strict';

import { EventEmitter } from 'events';
import qs from 'qs';
import crypto from 'crypto';
import { exec as childProcessExec } from 'child_process';

const hasOwn = (obj: any, prop: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, prop);

const OPTIONS_KEYS = [
  'apiKey',
  'idempotencyKey',
  'statesetAccount',
  'apiVersion',
  'maxNetworkRetries',
  'timeout',
  'host',
];

const DEPRECATED_OPTIONS: { [key: string]: string } = {
  api_key: 'apiKey',
  idempotency_key: 'idempotencyKey',
  stateset_account: 'statesetAccount',
  stateset_version: 'apiVersion',
  statesetVersion: 'apiVersion',
};
const DEPRECATED_OPTIONS_KEYS = Object.keys(DEPRECATED_OPTIONS);

interface Utils {
  isOptionsHash(o: any): boolean;
  stringifyRequestData(data: any): string;
  makeURLInterpolator(str: string): (outputs: { [key: string]: string }) => string;
  extractUrlParams(path: string): string[];
  getDataFromArgs(args: any[]): any;
  getOptionsFromArgs(args: any[]): {
    auth: string | null;
    headers: { [key: string]: string };
    settings: { [key: string]: any };
  };
  protoExtend(sub: any): any;
  secureCompare(a: string, b: string): boolean;
  removeNullish(obj: { [key: string]: any }): { [key: string]: any };
  normalizeHeaders(obj: { [key: string]: string }): { [key: string]: string };
  normalizeHeader(header: string): string;
  checkForStream(obj: any): boolean;
  callbackifyPromiseWithTimeout(promise: Promise<any>, callback?: (error: Error | null, response?: any) => void): Promise<any>;
  pascalToCamelCase(name: string): string;
  emitWarning(warning: string): void;
  safeExec(cmd: string, cb: (error: Error | null, result: string | null) => void): void;
  isObject(obj: any): boolean;
  flattenAndStringify(data: any): { [key: string]: string };
  uuid4(): string;
  validateInteger(name: string, n: number, defaultVal?: number): number;
  determineProcessUserAgentProperties(): { lang_version?: string; platform?: string };
}

const utils: Utils = {
  isOptionsHash(o: any): boolean {
    return (
      o &&
      typeof o === 'object' &&
      (OPTIONS_KEYS.some((prop) => hasOwn(o, prop)) ||
        DEPRECATED_OPTIONS_KEYS.some((prop) => hasOwn(o, prop)))
    );
  },

  protoExtend(sub: any): any {
    const Super = this.constructor as Function;
    
    const Constructor = function(this: any, ...args: any[]) {
      Super.apply(this, args);  // Apply parent constructor
    };
  
    Object.assign(Constructor, Super);
    Constructor.prototype = Object.create(Super.prototype); // Inherit prototype
    Object.assign(Constructor.prototype, sub);
  
    return Constructor;
  },

  stringifyRequestData(data: any): string {
    return qs
      .stringify(data, {
        serializeDate: (d: Date) => Math.floor(d.getTime() / 1000).toString(),
      })
      .replace(/%5B/g, '[')
      .replace(/%5D/g, ']');
  },

  makeURLInterpolator(str: string): (outputs: { [key: string]: string }) => string {
    const rc: { [key: string]: string } = {
      '\n': '\\n',
      '"': '\\"',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    };
    const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
    return (outputs: { [key: string]: string }) => {
      return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) =>
        encodeURIComponent(outputs[$1] || '')
      );
    };
  },

  extractUrlParams(path: string): string[] {
    const params = path.match(/\{\w+\}/g);
    return params ? params.map((param) => param.replace(/[{}]/g, '')) : [];
  },

  getDataFromArgs(args: any[]): any {
    if (!Array.isArray(args) || !args[0] || typeof args[0] !== 'object') {
      return {};
    }

    if (!utils.isOptionsHash(args[0])) {
      return args.shift();
    }

    const argKeys = Object.keys(args[0]);
    const optionKeysInArgs = argKeys.filter((key) => OPTIONS_KEYS.includes(key));

    if (optionKeysInArgs.length > 0 && optionKeysInArgs.length !== argKeys.length) {
      utils.emitWarning(
        `Options found in arguments (${optionKeysInArgs.join(
          ', '
        )}). Did you mean to pass an options object? See https://github.com/stateset/stateset-node/wiki/Passing-Options.`
      );
    }

    return {};
  },

  getOptionsFromArgs(args: any[]): {
    auth: string | null;
    headers: { [key: string]: string };
    settings: { [key: string]: any };
  } {
    const opts = {
      auth: null,
      headers: {} as Record<string, string>,
      settings: {
        maxNetworkRetries: 0,
        timeout: 0,
      },
      host: '',
    };
    
    opts.headers['Idempotency-Key'] = ''
    opts.headers['Stateset-Account'] = '';
    opts.headers['Stateset-Version'] = '';

    if (args.length > 0) {
      const arg = args[args.length - 1];
      if (typeof arg === 'string') {
        opts.auth = args.pop();
      } else if (utils.isOptionsHash(arg)) {
        const params = { ...args.pop() };

        const extraKeys = Object.keys(params).filter((key) => !OPTIONS_KEYS.includes(key));

        if (extraKeys.length) {
          const nonDeprecated = extraKeys.filter((key) => {
            if (!DEPRECATED_OPTIONS[key]) {
              return true;
            }
            const newParam = DEPRECATED_OPTIONS[key];
            if (params[newParam]) {
              throw Error(
                `Both '${newParam}' and '${key}' were provided; please remove '${key}', which is deprecated.`
              );
            }
            utils.emitWarning(`'${key}' is deprecated; use '${newParam}' instead.`);
            params[newParam] = params[key];
            return false;
          });
          if (nonDeprecated.length) {
            utils.emitWarning(
              `Invalid options found (${extraKeys.join(', ')}); ignoring.`
            );
          }
        }

        if (params.apiKey) {
          opts.auth = params.apiKey;
        }
        if (params.idempotencyKey) {
          opts.headers['Idempotency-Key'] = params.idempotencyKey;
        }
        if (params.statesetAccount) {
          opts.headers['Stateset-Account'] = params.statesetAccount;
        }
        if (params.apiVersion) {
          opts.headers['Stateset-Version'] = params.apiVersion;
        }
        if (Number.isInteger(params.maxNetworkRetries)) {
          opts.settings.maxNetworkRetries = params.maxNetworkRetries;
        }
        if (Number.isInteger(params.timeout)) {
          opts.settings.timeout = params.timeout;
        }
        if (params.host) {
          opts.host = params.host;
        }
      }
    }
    return opts;
  },

  secureCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    if (bufA.length !== bufB.length) {
      return false;
    }

    if (crypto.timingSafeEqual) {
      return crypto.timingSafeEqual(bufA, bufB);
    }

    let result = 0;
    for (let i = 0; i < bufA.length; ++i) {
      result |= bufA[i] ^ bufB[i];
    }
    return result === 0;
  },

  removeNullish(obj: { [key: string]: any }): { [key: string]: any } {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error('Argument must be an object');
    }

    return Object.keys(obj).reduce((result: { [key: string]: any }, key) => {
      if (obj[key] != null) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  normalizeHeaders(obj: { [key: string]: string }): { [key: string]: string } {
    if (!(obj && typeof obj === 'object')) {
      return obj;
    }

    return Object.keys(obj).reduce((result: { [key: string]: string }, header) => {
      result[utils.normalizeHeader(header)] = obj[header];
      return result;
    }, {});
  },

  normalizeHeader(header: string): string {
    return header
      .split('-')
      .map(
        (text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
      )
      .join('-');
  },

  checkForStream(obj: any): boolean {
    return obj?.file?.data instanceof EventEmitter;
  },

  callbackifyPromiseWithTimeout(
    promise: Promise<any>,
    callback?: (error: Error | null, response?: any) => void
  ): Promise<any> {
    if (callback) {
      return promise.then(
        (res) => {
          setTimeout(() => {
            callback(null, res);
          }, 0);
        },
        (err) => {
          setTimeout(() => {
            callback(err, null);
          }, 0);
        }
      );
    }

    return promise;
  },

  pascalToCamelCase(name: string): string {
    if (name === 'OAuth') {
      return 'oauth';
    } else {
      return name[0].toLowerCase() + name.substring(1);
    }
  },

  emitWarning(warning: string): void {
    if (typeof process.emitWarning !== 'function') {
      // eslint-disable-next-line no-console
      return console.warn(`Stateset: ${warning}`);
    }

    return process.emitWarning(warning, 'Stateset');
  },

  safeExec(cmd: string, cb: (error: Error | null, result: string | null) => void): void {
    try {
      childProcessExec(cmd, cb);
    } catch (e) {
      cb(e as Error, null);
    }
  },

  isObject(obj: any): boolean {
    const type = typeof obj;
    return (type === 'function' || type === 'object') && !!obj;
  },

  flattenAndStringify(data: any): { [key: string]: string } {
    const result: { [key: string]: string } = {};

    const step = (obj: any, prevKey: string) => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newKey = prevKey ? `${prevKey}[${key}]` : key;

        if (utils.isObject(value)) {
          if (!Buffer.isBuffer(value) && !Object.prototype.hasOwnProperty.call(value, 'data')) {
            return step(value, newKey);
          } else {
            result[newKey] = value;
          }
        } else {
          result[newKey] = String(value);
        }
      });
    };

    step(data, '');

    return result;
  },

  uuid4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  validateInteger(name: string, n: number, defaultVal?: number): number {
    if (!Number.isInteger(n)) {
      if (defaultVal !== undefined) {
        return defaultVal;
      } else {
        throw new Error(`${name} must be an integer`);
      }
    }

    return n;
  },

  determineProcessUserAgentProperties(): { lang_version?: string; platform?: string } {
    return typeof process === 'undefined'
      ? {}
      : {
          lang_version: process.version,
          platform: process.platform,
        };
  },
};

export default utils;
