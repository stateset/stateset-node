#!/usr/bin/env node

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value) => {
    if (
      value === null ||
      typeof value !== 'object'
    ) {
      return value;
    }

    return JSON.parse(JSON.stringify(value));
  };
}

require('../node_modules/eslint/bin/eslint.js');
