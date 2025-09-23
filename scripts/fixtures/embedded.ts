export const embeddedMinimalRoles = [
  {
    id: 'sales-manager-account-executive',
    role_id: 'sales-manager-account-executive',
    name: 'Sales Manager / AE',
    canonical_title: 'Sales Manager / AE',
    personas: ['sales_manager', 'account_exec'],
    domains: ['Sales'],
    summary: 'Fallback hybrid revenue role for seed scripts when catalogs are unavailable.',
    featureCaps: { cashflow_forecast: 5, lead_qualification: 2 },
  },
] as const;

export const embeddedMinimalFeatures = [
  {
    id: 'cashflow_forecast',
    title: 'Cashflow Forecast',
    category: 'finance',
    enabled: true,
    defaultAutonomyCap: 5,
    capabilities: ['finance.cashflow.forecast'],
  },
  {
    id: 'lead_qualification',
    title: 'Lead Qualification',
    category: 'sales',
    enabled: true,
    defaultAutonomyCap: 2,
    capabilities: ['crm.lead.qualify'],
  },
] as const;
