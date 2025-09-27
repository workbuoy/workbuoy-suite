declare module '../../../src/middleware/correlationHeader.js' {
  export function correlationHeader(...args: any[]): any;
}

declare module '../../../src/middleware/wbContext.js' {
  export function wbContext(...args: any[]): any;
}

declare module '../../../src/core/logging/logger.js' {
  export function requestLogger(...args: any[]): any;
}

declare module '../../../src/core/observability/metrics.js' {
  export const timingMiddleware: any;
  export const metricsHandler: any;
}

declare module '../../../src/core/http/middleware/errorHandler.js' {
  export const errorHandler: any;
}

declare module '../../../src/routes/_debug.bus.js' {
  export function debugBusHandler(...args: any[]): any;
}

declare module '../../../src/routes/knowledge.router.js' {
  const router: any;
  export default router;
}

declare module '../../../src/routes/audit.js' {
  export function auditRouter(...args: any[]): any;
}

declare module '../../../src/core/eventBusV2.js' {
  export const bus: any;
}

declare module '../../../src/features/crm/routes.js' {
  export function crmRouter(...args: any[]): any;
}

declare module '../../../src/features/tasks/routes.js' {
  export function tasksRouter(...args: any[]): any;
}

declare module '../../../src/features/log/routes.js' {
  export function logRouter(...args: any[]): any;
}

declare module '../../../src/features/deals/deals.router.js' {
  const router: any;
  export default router;
}

declare module '../../../src/routes/buoy.complete.js' {
  export function buoyRouter(...args: any[]): any;
}

declare module '../../../src/routes/insights.js' {
  export function insightsRouter(...args: any[]): any;
}

declare module '../../../src/routes/finance.reminder.js' {
  export function financeReminderRouter(...args: any[]): any;
}

declare module '../../../src/routes/manual.complete.js' {
  export function manualCompleteRouter(...args: any[]): any;
}

declare module '../../../src/routes/genesis.autonomy.js' {
  export function metaGenesisRouter(...args: any[]): any;
}

declare module '../../../src/routes/debug.dlq.js' {
  export function debugDlqRouter(...args: any[]): any;
}

declare module '../../../src/routes/debug.circuit.js' {
  export function debugCircuitRouter(...args: any[]): any;
}

declare module '../../../src/telemetry/usageSignals.js' {
  export const recordFeatureUsage: any;
  export const aggregateFeatureUseCount: any;
}

declare module '../../../src/telemetry/usageSignals.db.js' {
  const mod: any;
  export = mod;
}

declare module '../../../src/core/env.js' {
  export const envBool: any;
}

declare module '../../../src/roles/registry.js' {
  export class RoleRegistry {
    constructor(...args: any[]);
  }
}

declare module '../../../src/roles/loader.js' {
  export function loadRoleCatalog(...args: any[]): any;
}

declare module '../../../src/core/proactivity/context.js' {
  export type ProactivityState = any;
  export function buildProactivityContext(...args: any[]): any;
}

declare module '../../../src/core/proactivity/modes.js' {
  export const ProactivityMode: any;
  export function parseProactivityMode(...args: any[]): any;
}

declare module '../../../src/core/proactivity/telemetry.js' {
  export function getRecentProactivityEvents(...args: any[]): any;
  export function logModusskift(...args: any[]): any;
}

declare module '../../../src/roles/service.js' {
  export function getRoleRegistry(...args: any[]): any;
  export function resolveUserBinding(...args: any[]): any;
  export function importRolesAndFeatures(...args: any[]): any;
  export function listOverridesForTenant(...args: any[]): any;
  export function setOverride(...args: any[]): any;
}

declare module '../../../src/roles/types.js' {
  export type UserRoleBinding = any;
  export type OrgRoleOverride = any;
}

declare module '../../../src/core/proactivity/guards.js' {
  export function requiresProMode(...args: any[]): any;
}

declare module '../../../src/core/proposals/service.js' {
  export const listProposals: any;
  export const createProposal: any;
  export const sanitizeProposal: any;
  export const getProposal: any;
  export const markProposalApproved: any;
  export const markProposalExecuted: any;
  export const markProposalFailed: any;
  export const markProposalRejected: any;
  export const generateProposalIdempotencyKey: any;
}

declare module '../../../src/capabilities/registry.js' {
  export function getCapabilityImpl(...args: any[]): any;
}

declare module '../../../src/core/capabilityRunnerRole.js' {
  export function runCapabilityWithRole(...args: any[]): any;
}

declare module '../../../src/core/policy.js' {
  export function policyCheck(...args: any[]): any;
}

declare module '../../../src/core/intentLog.js' {
  export function logIntent(...args: any[]): any;
}

declare module '../../../src/core/subscription/state.js' {
  export function getSubscriptionForTenant(...args: any[]): any;
  export function getSubscriptionCap(...args: any[]): any;
  export function setSubscriptionForTenant(...args: any[]): any;
}

declare module '../../../src/core/subscription/entitlements.js' {
  export function isSubscriptionPlan(...args: any[]): any;
}

declare module '../../../src/core/security/rbac.js' {
  export function rbac(...args: any[]): any;
}

declare module '../../../src/connectors/internal/circuitRegistry.js' {
  export function getConnectorCircuitState(...args: any[]): any;
  export function listConnectorCircuits(...args: any[]): any;
}

declare module '../../../src/capabilities/testCaps.js' {
  export const testCaps: any;
}

declare module '../../../src/ingest/jobboards/pipeline.js' {
  export function extractFeatureCandidates(...args: any[]): any;
}

declare module '../../../../src/roles/registry.js' {
  export class RoleRegistry {
    constructor(...args: any[]);
  }
}

declare module '../../../src/*' {
  const value: any;
  export = value;
}

declare module '../../../../src/*' {
  const value: any;
  export = value;
}

declare module '../../src/*' {
  const value: any;
  export = value;
}

declare module '../../../../src/core/proactivity/context.js' {
  export type ProactivityState = any;
  export function buildProactivityContext(...args: any[]): any;
}

declare module '../../../../src/core/proactivity/modes.js' {
  export const ProactivityMode: any;
  export function parseProactivityMode(...args: any[]): any;
}

declare module '../../../../src/core/proactivity/telemetry.js' {
  export function logModusskift(...args: any[]): any;
}

declare module '../../../../src/roles/types.js' {
  export type UserRoleBinding = any;
}
