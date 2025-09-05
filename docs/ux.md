# Workbuoy UX Vision: Buoy AI + Navi

## Konseptoversikt

Workbuoy er en AI‑drevet kontorplattform hvor **Buoy AI** (graderbar, forklarbar assistent) og **Navi** (kontekstuell navigasjon) jobber sammen. Buoy AI lever på forsiden av et **flip‑kort** og gir samtalebasert assistanse. **Navi** bor på baksiden og organiserer add‑ons (e‑post, CRM, ERP osv.) og datavisualiseringer i et rutenett. Kortet snus via knapp eller tast og roterer 180°【158162014912867†L78-L112】.

## Flip‑kort interaksjonsmodell

* **Buoy AI chat (forside)** – Brukeren stiller spørsmål eller gir kommandoer; assistenten svarer med tekst og små visualiseringer.
* **Navi add‑ons (bakside)** – Et rutenett med integrasjoner. Kortet snus ved klikk eller tastatur. På små skjermer brukes vertikal snuing.

## Mikro‑visualiseringer

Mikro‑visualiseringer er små diagrammer eller tabeller som vises direkte i chatten. De støtter større datasett og bør være forståelige med et blikk, med enkle interaksjoner som tooltips【334328420731481†L51-L55】【334328420731481†L61-L65】【334328420731481†L71-L77】. Sparklines, mini‑bars og mini‑donuts er gode eksempler for begrenset plass【334328420731481†L106-L124】.

## Tilgjengelighet (A11y)

* **Tydelige fokusringer** og stort treffareal på knapper og kort.
* **Tastaturstøtte** – Kortet kan snus med Space/Enter via `tabindex` og tastelytting.
* **ARIA‑etiketter** – Chatboks med `aria-live="polite"`, flipkort-region med `aria-label` og knapper med beskrivende etiketter.
* **Kontrast og fontstørrelser** – Farger med høy kontrast og tydelig hierarki.

## “Vis hvorfor” – forklarbarhet

Alle AI‑forslag skal ha en knapp “Vis hvorfor” som åpner en skuff med forklaringer, sitater og kilder. Dette øker tillit og gir kontroll over autonomien.

Se også `prototypes/FlipCardPrototype.tsx` for en React‑prototype.
