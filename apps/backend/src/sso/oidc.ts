/**
 * @deprecated Import authentication helpers from `@workbuoy/backend-auth` instead.
 */
export {
  createAuthRouter as ssoRouter,
  createRequireAuth as requireAuth,
  createAuthModule,
  type AuthRouterOptions,
  type AuthModuleOptions,
  type AuditLogger,
  type AuthenticatedRequest,
} from '@workbuoy/backend-auth';
