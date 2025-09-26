// Ensures NodeNext typecheck in backend can resolve the workspace sources
declare module "@workbuoy/backend-metrics" {
  export * from "../../../packages/backend-metrics/src/index";
}
declare module "@workbuoy/backend-metrics/*" {
  export * from "../../../packages/backend-metrics/src/*";
}
