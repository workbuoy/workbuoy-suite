// src/core/logging/index.ts
export * from './maskValue';
// re-export existing logger (if any)
try { module.exports = require('./logger'); } catch {}
