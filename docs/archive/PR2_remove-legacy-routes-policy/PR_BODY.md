# cleanup: remove legacy routes/policy (guard via lint)

**What**  
Add ESLint rule to prevent new legacy imports; legacy can be quarantined gradually.

**Why**  
Stops further drift while ongoing dev continues; non-invasive.

**Files touched**  
- .eslintrc.cleanup.cjs

**Risk**  
Low.

**Testing steps**  
npm run lint --if-present

**Smoke**  
```
grep -R "policy.ts" src | grep -v "_legacy" | wc -l
```

**Checklist (DoD)**  
- [ ] Tests green  
- [ ] CI green (lint + coverage)  
- [ ] No breaking API changes  
- [ ] PII masking + correlation IDs preserved  
- [ ] Acceptance checks (grep/curl) pass
