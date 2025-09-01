
import React from 'react';
import PortalLayout from '../../components/PortalLayout';
import Link from 'next/link';

const steps=['Velkommen','Bedriftsinfo','Plan','Kobling','Ferdig'];

export default function Onboarding(){
  const [i,setI]=React.useState(0);
  const [company,setCompany]=React.useState({name:'',orgnr:''});
  const [plan,setPlan]=React.useState('Solo Pro');
  const [skipConnector,setSkipConnector]=React.useState(true);

  const next=()=> setI(Math.min(i+1, steps.length-1));
  const prev=()=> setI(Math.max(i-1, 0));

  React.useEffect(()=>{
    // ensure user session exists; omitted for brevity
  },[]);

  const finish=async()=>{
    await fetch('/api/portal/onboarding/complete',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({company,plan,skipConnector})});
    location.href='/portal';
  }

  return <PortalLayout>
    <h1>Kom i gang</h1>
    <div style={{margin:'12px 0'}}>Steg {i+1} av {steps.length}: <b>{steps[i]}</b></div>

    {i===0 && <section>
      <p>Hei! Vi hjelper deg å komme i gang på noen få steg.</p>
      <button onClick={next}>Start</button>
    </section>}

    {i===1 && <section>
      <label>Bedriftsnavn<br/><input placeholder="Eks: Ola Bygg AS" value={company.name} onChange={e=>setCompany({...company,name:e.target.value})}/></label>
      <br/>
      <label>Org.nr (valgfritt)<br/><input placeholder="Eks: 123456789" value={company.orgnr} onChange={e=>setCompany({...company,orgnr:e.target.value})}/></label>
      <div style={{marginTop:12}}>
        <button onClick={prev}>Tilbake</button>
        <button onClick={next} style={{marginLeft:8}}>Fortsett</button>
      </div>
    </section>}

    {i===2 && <section>
      <p>Velg plan (kan endres senere):</p>
      <select value={plan} onChange={e=>setPlan(e.target.value)}>
        <option>Solo Pro</option><option>Team</option><option>Business</option>
      </select>
      <div style={{marginTop:12}}>
        <button onClick={prev}>Tilbake</button>
        <button onClick={next} style={{marginLeft:8}}>Fortsett</button>
      </div>
    </section>}

    {i===3 && <section>
      <p>Vil du koble første kanal nå, eller hoppe over?</p>
      <label><input type="checkbox" checked={skipConnector} onChange={e=>setSkipConnector(e.target.checked)}/> Hopp over (kan aktiveres senere)</label>
      <div style={{marginTop:12}}>
        <button onClick={prev}>Tilbake</button>
        <button onClick={next} style={{marginLeft:8}}>Fortsett</button>
      </div>
    </section>}

    {i===4 && <section>
      <p>Ferdig! Klikk Fortsett for å gå til dashboard.</p>
      <button onClick={finish}>Fortsett</button>
    </section>}
  </PortalLayout>;
}
