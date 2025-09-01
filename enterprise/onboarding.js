import React,{useState,useEffect} from 'react';
export default function Onboard(){
  const [email,setEmail]=useState('');
  const [link,setLink]=useState(''); const [step,setStep]=useState(1); const [plan,setPlan]=useState('Solo Pro');
  const next=()=>setStep(s=>Math.min(5,s+1));
  return <div style={{maxWidth:700,margin:'20px auto',fontFamily:'system-ui'}}>
    <h1>Kom i gang</h1>
    <div style={{background:'#eee',borderRadius:8,overflow:'hidden',margin:'10px 0 20px'}}><div style={{width:`${(step/5)*100}%`,height:10,background:'#38bdf8'}}/></div>
    {step===1 && <section><h3>1. Opprett konto</h3><p>E-post, så får du en magisk lenke.</p>
      <form onSubmit={async e=>{e.preventDefault();const r=await fetch('/api/auth/magic/request',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})});const j=await r.json();setLink(j.magic_link||'');next();}}>
        <input placeholder="ola@eksempel.no" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:10,border:'1px solid #ddd',borderRadius:8,width:'100%'}}/>
        <div style={{marginTop:10}}><button type="submit">Send lenke</button></div>
      </form>{link && <p>Dev: <a href={link}>Åpne magisk lenke</a></p>}</section>}
    {step===2 && <section><h3>2. Opprett firma</h3><p>Navn holder. Org.nr. kan legges inn senere.</p>
      <form onSubmit={e=>{e.preventDefault();next();}}><input placeholder="Olas Snekkertjenester AS" style={{padding:10,border:'1px solid #ddd',borderRadius:8,width:'100%'}}/>
      <div style={{marginTop:10}}><button type="submit">Fortsett</button> <button type="button" onClick={next}>Hopp over</button></div></form></section>}
    {step===3 && <section><h3>3. Velg plan</h3><p>Solo Pro passer for én person.</p>
      <select value={plan} onChange={e=>setPlan(e.target.value)}><option>Solo Pro</option><option>Team</option><option>Business</option></select>
      <div style={{marginTop:10}}><button onClick={async()=>{const r=await fetch('/api/billing/checkout-session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan})});const j=await r.json();if(j.url) location.href=j.url;}}>Gå til betaling (test)</button>
      <button style={{marginLeft:10}} onClick={next}>Hopp over</button></div></section>}
    {step===4 && <section><h3>4. Koble til første kanal</h3><p>Du kan hoppe over og koble senere.</p><a href="/portal/connectors">Gå til koblinger</a><div style={{marginTop:10}}><button onClick={next}>Hopp over</button></div></section>}
    {step===5 && <section><h3>5. Ferdig!</h3><p>Se dashboard og neste steg.</p><a href="/portal">Åpne dashboard</a></section>}
    <div style={{marginTop:20}}><a href="/help">Trenger du hjelp?</a></div></div>;
}
