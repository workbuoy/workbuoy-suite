
import React from 'react';
import PortalLayout from '../../components/PortalLayout';
export default function Settings(){
  const [recognize,setRecognize]=React.useState(false);
  React.useEffect(()=>{ fetch('/api/portal/settings').then(r=>r.json()).then(j=>setRecognize(!!j.recognize_other_buoy)); },[]);
  const save=async()=>{
    await fetch('/api/portal/settings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({recognize_other_buoy:recognize})});
    alert('Lagret');
  };
  return <PortalLayout>
    <h1>Innstillinger</h1>
    <label><input type="checkbox" checked={recognize} onChange={e=>setRecognize(e.target.checked)} /> La Buoy gjenkjenne andre Buoy</label>
    <div><button onClick={save} style={{marginTop:12}}>Lagre</button></div>
  </PortalLayout>;
}
