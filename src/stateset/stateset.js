'use strict';

let statesetModule;

try {
  statesetModule = require('../Stateset');
} catch {
  // Support running directly from TypeScript sources during tests
  statesetModule = require('../Stateset.ts');
}

const { Stateset } = statesetModule;

const normalizeOptions = options => {
  if (typeof options === 'string') {
    return { apiKey: options };
  }

  if (!options || typeof options !== 'object') {
    return {};
  }

  return { ...options };
};

class LegacyStateset extends Stateset {
  constructor(options = {}) {
    super(normalizeOptions(options));
  }

  static create(options = {}) {
    return new LegacyStateset(options);
  }

  static fromApiKey(apiKey, options = {}) {
    return new LegacyStateset({ ...normalizeOptions(options), apiKey });
  }
}

const createLegacyClient = options => LegacyStateset.create(options);

module.exports = Object.assign(createLegacyClient, {
  LegacyStateset,
  Stateset: LegacyStateset,
  StatesetClient: LegacyStateset,
  default: LegacyStateset,
  create: LegacyStateset.create,
  fromApiKey: LegacyStateset.fromApiKey,
});
