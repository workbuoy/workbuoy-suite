export interface RequestContext {
  user?: any;
  tenant?: string;
  autonomyLevel?: number;
  role?: string;
}

export function getRequestContext(): RequestContext {
  // TODO: extract context from request or session
  return {};
}
