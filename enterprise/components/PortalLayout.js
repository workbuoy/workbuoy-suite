
import React from 'react';
import Link from 'next/link';

export default function PortalLayout({children}){
  return <div style={{fontFamily:'system-ui'}}>
    <div style={{background:'#fff7d6',borderBottom:'1px solid #f0e6b3',padding:'8px 16px'}}>
      <b>Viktig: WorkBuoy kan gjøre feil. Sjekk viktig informasjon.</b> <Link href="/portal/info">Les mer</Link>
    </div>
    <div style={{maxWidth:900, margin:'20px auto', padding:'0 12px'}}>{children}</div>
    <footer style={{marginTop:40, padding:'12px 16px', borderTop:'1px solid #eee'}}>
      Viktig: WorkBuoy kan gjøre feil. Sjekk viktig informasjon. <Link href="/portal/info">Se viktig informasjon</Link>
    </footer>
  </div>;
}
