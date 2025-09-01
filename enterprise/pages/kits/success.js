import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Success(){
  const router = useRouter();
  const { session_id } = router.query;
  const [status,setStatus]=useState('Processing payment...');
  const [link,setLink]=useState('');

  useEffect(()=>{
    if(!session_id) return;
    (async()=>{
      const r = await fetch('/api/stripe/session?id='+session_id);
      const j = await r.json();
      if(j.download){
        setStatus('Ready!');
        setLink(j.download);
      }else{
        setStatus(j.message || 'Not ready yet.');
      }
    })();
  },[session_id]);

  return <div className="container">
    <div className="panel">
      <h1>Payment Success</h1>
      <p>{status}</p>
      {link && <a href={link}>Download your kit</a>}
    </div>
  </div>
}
