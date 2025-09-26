/// <reference types="node" />

declare module '../require.js' {
  export * from '../require';
  export { default } from '../require';
}

declare module '../utils/assert.js' {
  export * from '../utils/assert';
  export { default } from '../utils/assert';
}
