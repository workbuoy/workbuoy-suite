// Ensures TS can always resolve workspace packages during typecheck
declare module '@workbuoy/backend-telemetry' {
  export * from '../../../packages/backend-telemetry/src/index';
}
declare module '@workbuoy/backend-rbac' {
  export * from '../../../packages/backend-rbac/src/index';
}
declare module '@workbuoy/backend-metrics' {
  export * from '../../../packages/backend-metrics/src/index';
}
