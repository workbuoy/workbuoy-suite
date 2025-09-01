
import React from 'react';
import PortalLayout from '../../components/PortalLayout';
export default function Users(){
  const [email,setEmail]=React.useState('');
  const invite=async()=>{
    await fetch('/api/org/invite',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,role:'admin'})});
    alert('Invitasjon sendt');
  };
  return <PortalLayout>
    <h1>Brukere</h1>
    <input placeholder="epost@firma.no" value={email} onChange={e=>setEmail(e.target.value)}/>
    <button onClick={invite}>Inviter</button>
  </PortalLayout>;
}
