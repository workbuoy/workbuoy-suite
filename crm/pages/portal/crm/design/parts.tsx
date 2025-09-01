import React from 'react';

export function Palette(){
  const tokens = [
    ['BG','--wb-bg'],['Surface','--wb-surface'],['Muted','--wb-muted'],['Border','--wb-border'],
    ['Text','--wb-text'],['Subtle','--wb-subtle'],['Primary','--wb-primary'],
    ['Primary600','--wb-primary-600'],['Accent','--wb-accent'],['Danger','--wb-danger'],
    ['Success','--wb-success'],['Warm','--wb-warm-1']
  ];
  return (
    <div className="wb-card">
      <h3>Fargepalett</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,minmax(0,1fr))', gap:12 }}>
        {tokens.map(([name,varn])=> (
          <div key={name} className="wb-card" style={{ padding:12 }}>
            <div style={{ height:48, borderRadius:8, background:`var(${varn})`, border:'1px solid var(--wb-border)' }} />
            <div style={{ fontSize:12, marginTop:8 }}>{name}</div>
            <code style={{ fontSize:11, color:'var(--wb-subtle)' }}>{varn}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Button(){
  return (
    <div className="wb-card">
      <h3>Knapper</h3>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <a className="wb-btn">Standard</a>
        <a className="wb-btn wb-btn--primary">Primær</a>
        <a className="wb-btn" style={{ borderColor:'var(--wb-danger)', color:'var(--wb-danger)' }}>Fare</a>
      </div>
    </div>
  );
}

export function Cards(){
  return (
    <div className="wb-card">
      <h3>Kort og tabell</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:12 }}>
        <div className="wb-card">
          <h4 style={{ fontWeight:700, marginBottom:8 }}>Kort</h4>
          <p className="wb-sub">Subtilt kort med hover heving og skygging.</p>
        </div>
        <div className="wb-card">
          <table className="wb-table">
            <thead><tr><th>Navn</th><th>Stage</th><th>Beløp</th></tr></thead>
            <tbody>
              <tr><td>Acme Pilot</td><td><span className="wb-badge">Lead</span></td><td>50.000</td></tr>
              <tr><td>Globex</td><td><span className="wb-badge">Won</span></td><td>120.000</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
