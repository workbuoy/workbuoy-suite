# GDPR – DSR, dataminimering og retensjon (PR AN)

Denne modulen gir et **mock**-grunnlag for dataport, eksport og sletting.
Bruk den som mal for produksjons-implementasjon bak eksisterende RBAC, audit og webhook-infrastruktur.

## DSR-SLA (forslag)
- **Export/Access**: 30 dager
- **Deletion**: 30 dager (med unntak for lovpålagt oppbevaring)
- **Portability**: 30 dager

## Dataretensjon (eksempel)
| Datatype | Formål | Retensjon |
|---|---|---|
| CRM Contacts | Forretningsdrift | 24 mnd etter inaktivitet |
| Opportunities | Salg | 36 mnd |
| Audit logs | Sikkerhet/revisjon | 13 mnd |
| Webhook logs | Integrasjoner | 90 dager |

## Prosess
1. **Bekreft identitet** (KYC/ownership) før kjøring.
2. **Eksport** → generer datapakke (kryptert), del via tidsbegrenset URL.
3. **Sletting** → soft-delete + purge jobs.
4. **Portability** → strukturerte JSON-filer med metadata og mapping.
