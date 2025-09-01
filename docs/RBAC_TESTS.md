# RBAC tester – CRM record-nivå (PR AL)

Denne PR-en legger til en realistisk RBAC-policy med tester og audit-verifikasjon.

## Roller & policy (kortversjon)
| Rolle | Read | Create | Update/Delete |
|---|---|---|---|
| viewer | Non-sensitive eller samme team | ❌ | ❌ |
| contributor | ✅ | Kun egne; ikke sensitive | Egne ikke-sensitive; ingen pipeline-kryssing |
| manager | Team-omfang | ✅ | Team-omfang; kan endre sensitive og pipeline |
| admin | Alt | ✅ | Alt |

Felt:
- `owner_id`, `team_id`, `sensitive`, `pipeline_id`

## Slik kjøres testene
```bash
cd backend
npm ci
npm run build
npm test
```

## Hva verifiseres
- **Allow/Deny** for alle roller i representative scenarier
- **Audit**: alle mutasjoner skriver entry med `allowed`, `reason`, `before/after`

## Utvidelser (forslag)
- Les policy fra OIDC-claims i stedet for headers
- Record-level ACL-liste (delegering) i tillegg til team
- Stage-level guards (spesifikke overganger)
