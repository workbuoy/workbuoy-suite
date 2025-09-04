import React, { useState } from 'react';

/**
 * A simple flip‑card component that demonstrates how Buoy AI and Navi could
 * coexist on two sides of the same UI element. When `isFlipped` is true the
 * card rotates around the Y‑axis to reveal the back. The front contains a
 * placeholder chat area along with an example sparkline micro‑visualization,
 * while the back shows a grid of add‑on modules. Styling is kept inline
 * for clarity; in production, move styles into CSS modules or a styling
 * solution of your choice.
 */
export default function FlipCardPrototype() {
  const [isFlipped, setFlipped] = useState(false);

  /**
   * Handle keyboard interactions for accessibility. If the user presses
   * Space or Enter while the card has focus, toggle the flipped state.
   */
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFlipped((prev) => !prev);
    }
  }

  return (
    <div style={{ perspective: '1000px', width: '100%', height: '400px' }}>
      {/* The inner container is focusable and labelled for screen readers. */}
      <div
        role="region"
        aria-label="Buoy AI og Navi kort"
        tabIndex={0}
        onKeyDown={handleKeyDown}
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
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '1rem',
              background: '#fff',
              borderRadius: '4px',
              padding: '0.5rem'
            }}
            aria-live="polite"
          >
            {/* Eksempel på chatmeldinger */
            <p><strong>Bruker:</strong> Hva er omsetningstrenden vår?</p>
            <p><strong>Buoy:</strong> Her er en rask oversikt:</p>
            {/* Sparkline mikro‑visualisering med tooltip */}
            <svg
              width="100%"
              height="40"
              aria-label="Liten graf som viser omsetningstrend"
            >
              <title>Omsetning de siste fem månedene</title>
              <polyline
                fill="none"
                stroke="#007acc"
                strokeWidth="2"
                points="0,30 25,20 50,25 75,10 100,20"
              />
            </svg>
            {/* Vis hvorfor‑knapp: placeholder for forklaringer/kilder */}
            <button
              type="button"
              onClick={() => {
                /* TODO: connect to explanation drawer */
                alert('Dette vil vise forklaringen og kilder.');
              }}
              style={{ marginTop: '0.5rem' }}
            >
              Vis hvorfor
            </button>
          </div>
          <button
            type="button"
            onClick={() => setFlipped(true)}
            style={{ alignSelf: 'center' }}
            aria-label="Åpne Navi"
          >
            Åpne Navi
          </button>
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
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              flex: 1,
              overflowY: 'auto'
            }}
          >
            {['Outlook', 'SharePoint', 'CRM', 'ERP', 'Analyse'].map((addon) => (
              <div
                key={addon}
                style={{
                  flex: '1 1 45%',
                  minWidth: '120px',
                  background: '#fff',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                {addon}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFlipped(false)}
            style={{ alignSelf: 'center' }}
            aria-label="Gå tilbake til Buoy AI"
          >
            Tilbake til Buoy AI
          </button>
        </div>
      </div>
    </div>
  );
}
