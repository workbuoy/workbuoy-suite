import type { Request, RequestHandler } from 'express';
export type AuthAuditEvent = {
    type: string;
    tenant_id: string;
    actor_id: string;
    details?: Record<string, unknown>;
};
export type AuditLogger = (event: AuthAuditEvent) => void;
export interface AuthRouterOptions {
    /** Toggle SSO endpoints. Defaults to process.env.SSO_ENABLED. */
    ssoEnabled?: boolean;
    /** Enable the development mock login flow. Defaults to process.env.OIDC_DEV_MOCK. */
    devMock?: boolean;
    /** Secret used for signing JWT cookies. Defaults to process.env.SESSION_SECRET. */
    jwtSecret?: string;
    /** Name of the session cookie. Defaults to `wb_sess`. */
    cookieName?: string;
    /** Default tenant fallback when not provided by request. */
    defaultTenantId?: string;
    /** OIDC issuer discovery URL. */
    issuerUrl?: string;
    /** OIDC client ID. */
    clientId?: string;
    /** OIDC client secret. */
    clientSecret?: string;
    /** Callback URL registered with the IdP. */
    callbackUrl?: string;
    /** Optional audit hook invoked on login flows. */
    audit?: AuditLogger;
}
export interface AuthenticatedRequest extends Request {
    actor_user_id?: string;
    roles?: string[];
    tenant_id?: string;
}
export declare function createAuthRouter(options?: AuthRouterOptions): import("express-serve-static-core").Router;
export declare function createRequireAuth(options?: AuthRouterOptions): RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function createAuthModule(options?: AuthRouterOptions): {
    router: import("express-serve-static-core").Router;
    requireAuth: RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
};
export type { AuthRouterOptions as AuthModuleOptions };
export { createAuthRouter as AuthRouter };
//# sourceMappingURL=index.d.ts.map