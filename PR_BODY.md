# feat(ux): WhyDrawer polish (PR-26)

**Hva**
- Ny versjon av `WhyDrawer` som støtter rike forklaringer (title/quote/link/source) og er bakoverkompatibel med `string[]`.
- A11y og ergonomi: ESC-lukk, fokusstyring, kopier-knapp, åpne-kilde per rad.
- `docs/whydrawer.md` beskriver bruk og videre muligheter.

**Hvorfor**
- Forklarbarhet må være skarp og delbar. Dette gjør forslagene troverdige og lette å revidere.

**Hvordan teste**
- Trigge en chip i Buoy (f.eks. “Send purring”) → WhyDrawer åpnes.
- Klikk **Kopier** → lim inn resultatet i et tekstdokument.
- Åpne kilde-lenke hvis tilgjengelig (ny fane).

**Risiko/rollback**
- Kun frontend + docs. Kompatibel med eksisterende `string[]`-explanations.