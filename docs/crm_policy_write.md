# CRM Write Policy (PR-29)

- `policyGuardWrite` blokkerer POST/DELETE når `autonomy < 1`.
- `explanations[]` returneres i 403 for WhyDrawer.
- Enkle in-memory kontakter i `crm.contacts.ts` (MVP).