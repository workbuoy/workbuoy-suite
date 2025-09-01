# ONBOARDING

Denne guiden viser hva brukeren ser når de starter:
1. Registrering/innlogging (magic link + Google/Microsoft SSO dersom aktivert).
2. **Start her:** Koble e-post/kalender først for kjapp verdi.
3. **Velg systemer:** Kategorier, avkrysningsbokser og «Koble til alle».
4. **IT-godkjenning (ved behov):** Side med hva som skjer, hvordan godkjenne og hvordan trekke tilbake.
5. Ferdig – forslag til neste steg (Importer kalendere, Vis kundemøter på kart, Prøv /søk eller /kart).

Skjermbilder: se `/pages/portal/onboarding/systems.tsx` og `/pages/portal/onboarding/admin-consent.tsx`.


## SSO (OIDC & SAML)
- OIDC: AzureAD/Okta/Google – nonce/state + JWKS verifikasjon (se `pages/api/auth/sso-login|sso-callback.js`).
- SAML: metadata + ACS med signaturverifikasjon (xml-crypto). Sett ENV: `SAML_ENTITY_ID`, `SAML_IDP_CERT`, `SAML_ACS_URL`.

## SCIM
- Endepunkt: `/api/scim/v2/Users`, `/api/scim/v2/Groups`, `/api/scim/v2/groups/members`
- Støtte for `filter`, `startIndex`, `count`, ETag (`If-Match`).
