# Workbuoy UX Vision: Buoy AI + Navi

## Concept overview

Workbuoy er bygget som en AI‑drevet kontorplattform hvor **Buoy AI** (en graderbar, forklarbar assistent) og **Navi** (et kontekstuelt navigasjonslag) jobber sammen for å gi brukeren et enkelt, men kraftig grensesnitt. Buoy AI opererer på forsiden av et *flip‑kort* og gir samtalebasert assistanse. Navi lever på baksiden av samme kort og organiserer add‑ons (e‑post, CRM, ERP osv.) og datavisualiseringer i et oversiktlig rutenett. Flip‑kortet er basert på et velkjent mønster hvor et kort snus for å avsløre baksiden når brukeren klikker eller sveiper【158162014912867†L78-L112】.

## Flip‑kort interaksjonsmodell

**Forside – Buoy AI chat**

* Den synlige siden viser et chatgrensesnitt. Brukere kan stille spørsmål eller gi kommandoer, og Buoy AI svarer med naturlig språk. Enkelt handlinger som «vis omsetningen forrige måned» tolkes og utføres; resultater presenteres direkte i chatten som tekst eller små visualiseringer.

**Bakside – Navi add‑ons**

* Når kortet snus, kommer Navi frem. Her finner brukerne et rutenett med add‑ons som representerer integrasjoner (Outlook, SharePoint, CRM, ERP, analyseverktøy m.m.) og kontekstuelle datasett. Snufunksjonen aktiveres via en knapp eller sveip; på små skjermer bruker vi vertikal snuing for å spare plass. Mønsteret bygger på at knappen endrer flip‑tilstand og roterer kortet 180° for å vise baksiden【158162014912867†L109-L112】.

## Mikro‑visualiseringer i chatten

Mange forespørsler returnerer strukturerte data. I stedet for å sende brukeren til separate dashbord, viser Workbuoy **mikro‑visualiseringer** – små diagrammer eller tabeller – direkte i samtalen. Gestalt sin veiledning for mikro‑visualiseringer beskriver disse som små grafiske fremstillinger som støtter større datasett og kan vises i tabeller, kort eller pop‑over for å gi rask kontekst【334328420731481†L51-L55】. De fungerer best når brukeren kan forstå hovedpoenget med et blikk【334328420731481†L61-L65】, og de bør være interaktive med tooltips eller mulighet for utvidelse【334328420731481†L71-L77】. Sparklines, mini‑bars og mini‑donuts passer godt i den begrensede plassen i en chatboble【334328420731481†L106-L124】. I Workbuoy velger Buoy AI automatisk passende visualiseringer og viser dem sammen med forklarende tekst.

## React‑prototyp med flip‑kort

Under er et enkelt React‑komponent som illustrerer flip‑kort‑mønsteret. Forsiden inneholder en placeholder for Buoy AI‑chatten og et eksempel på en mikro‑visualisering. Baksiden viser en liste over add‑ons. En knapp bytter `isFlipped`‑tilstanden og roterer kortet. For enkelhetens skyld er stilene inline; i en ekte applikasjon bør de flyttes til CSS‑moduler eller styled‑components.

```tsx
import React, { useState } from 'react';

export default function FlipCardPrototype() {
  const [isFlipped, setFlipped] = useState(false);

  return (
    <div style={{ perspective: '1000px', width: '100%', height: '400px' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'none'
        }}
      >
        {/* Forside: Buoy AI chat */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            boxSizing: 'border-box',
            backgroundColor: '#F4F7FA',
            borderRadius: '8px'
          }}
        >
          <h2>Buoy AI</h2>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', background: '#fff', borderRadius: '4px', padding: '0.5rem' }}>
            {/* Chatmeldinger */
            <p><strong>Bruker:</strong> Hva er omsetningstrenden vår?</p>
            <p><strong>Buoy:</strong> Her er en rask oversikt:</p>
            {/* Eksempel på mikro‑visualisering (sparkline) */}
            <svg width="100%" height="40">
              <polyline
                fill="none"
                stroke="#007acc"
                strokeWidth="2"
                points="0,30 25,20 50,25 75,10 100,20"
              />
            </svg>
          </div>
          <button onClick={() => setFlipped(true)} style={{ alignSelf: 'center' }}>Åpne Navi</button>
        </div>

        {/* Bakside: Navi‑add‑ons */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            boxSizing: 'border-box',
            backgroundColor: '#F0F4F8',
            borderRadius: '8px'
          }}
        >
          <h2>Navi‑add‑ons</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
            {['Outlook','SharePoint','CRM','ERP','Analytics'].map((addon) => (
              <div key={addon} style={{ flex: '1 1 45%', minWidth: '120px', background: '#fff', borderRadius: '4px', padding: '0.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {addon}
              </div>
            ))}
          </div>
          <button onClick={() => setFlipped(false)} style={{ alignSelf: 'center' }}>Tilbake til Buoy AI</button>
        </div>
      </div>
    </div>
  );
}
`

## Videre arbeid

1. **Komponentintegrasjon** – Flytt prototypen inn i riktig front‑end‑pakke (for eksempel `enterprise/pages` eller et delt komponentbibliotek) og erstatt placeholder‑innhold med ekte chat‑ og add‑on‑komponenter.
2. **Stil og responsivitet** – Ekstraher stiler til CSS‑moduler eller styled‑components, og sørg for at flip‑kortet fungerer på mobil med vertikal orientasjon.
3. **Mikro‑visualiseringsbibliotek** – Integrer et diagrambibliotek (for eksempel Chart.js eller D3) for dynamisk rendering av sparklines og mini‑diagrammer. Husk å annotere nøkkelpunkter og tilby tooltips【334328420731481†L71-L86】.
4. **Tilgjengelighet** – Gi tastaturnavigasjon for flipping (for eksempel bruk av mellomromstasten), skjermleser‑etiketter for knappene og alternativ tekst for diagrammer.
