export type RoleId =
  | 'cfo' | 'finance_director'
  | 'sales_rep' | 'sales_manager' | 'sales_director'
  | 'ops_manager' | 'hr_director' | 'cs_manager'
  | 'revops' | 'board_member'
  | (string & {});

export interface FeatureDef {
  id: string;
  title: string;
  description?: string;
  defaultAutonomyCap?: 1|2|3|4|5|6;
  capabilities: string[];
}

export interface RoleProfile {
  role_id: RoleId;
  canonical_title: string;
  alt_titles?: string[];
  domains?: string[];
  sectors?: string[];
  seniority?: string;
  summary?: string;
  mission?: string;
  core_tasks?: string[];
  systems_primary?: string[];
  systems_secondary?: string[];
  kpis?: string[];
  artifacts?: string[];
  stakeholders_internal?: string[];
  stakeholders_external?: string[];
  ai_assists?: string[];
  event_hooks?: string[];
  policies?: Record<string, any>;
  notes?: string;
  inherits?: RoleId[];
  featureCaps?: Record<string, 1|2|3|4|5|6>;
  scopeHints?: Record<string, any>;
}

export interface OrgRoleOverride {
  tenantId: string;
  role_id: RoleId;
  featureCaps?: Record<string, 1|2|3|4|5|6>;
  disabledFeatures?: string[];
}

export interface UserRoleBinding {
  userId: string;
  primaryRole: RoleId;
  secondaryRoles?: RoleId[];
}
