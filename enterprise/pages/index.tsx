import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column'}}>
      <div style={{position:'fixed', bottom:16, right:16, display:'flex', gap:12, zIndex:1000}}>
        <Link href="/portal"><a style={btn}>Portal</a></Link>
        <Link href="/portal/unified"><a style={btn}>Unified Box</a></Link>
        <Link href="/portal/map"><a style={btn}>Kart</a></Link>
      </div>
      <iframe src="/marketing.html" style={{border:'none', flex:1}} title="Marketing"></iframe>
      <div style={{fontSize:12, textAlign:'center', padding:'6px 8px', color:'#666'}}>Workbuoy kan gjøre feil. Sjekk viktig informasjon før du handler.</div>
    </div>
  );
}
const btn: React.CSSProperties = {
  background:'#111', color:'#fff', padding:'10px 14px', borderRadius:12, textDecoration:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
};
