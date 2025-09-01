import { useState } from 'react';

export default function Home(){
  const [email,setEmail]=useState('demo@workbuoy.ai');
  const [password,setPassword]=useState('demo123');
  const [token,setToken]=useState('');
  const [mode,setMode]=useState('Calm');
  const [input,setInput]=useState('Hello WorkBuoy');
  const [result,setResult]=useState(null);

  async function login(){
    const r = await fetch('/api/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})});
    const j = await r.json();
    if(j.token) setToken(j.token);
  }
  async function runMode(){
    const r = await fetch('/api/modes/handle',{method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({mode,input,context:{entity:'invoice'}})});
    setResult(await r.json());
  }
  async function listRoles(){
    const r = await fetch('/api/roles?limit=5',{headers:{'Authorization':'Bearer '+token}});
    const j = await r.json();
    alert('Loaded '+(j.roles?.length||0)+' roles');
  }
  async function buyKit(){
    const r = await fetch('/api/stripe/create-checkout-session',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({kit_id:'slides-3up'})});
    const j = await r.json();
    if(j.url) window.location = j.url; else alert('Stripe not configured');
  }

  return <div className="container">
    <h1>WorkBuoy</h1>
    <div className="panel">
      <h2>Login</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" />
      <button onClick={login}>Login</button>
      <p>Token: {token ? '✅' : '❌'}</p>
    </div>
    <div className="panel">
      <h2>Proactivity</h2>
      <select value={mode} onChange={e=>setMode(e.target.value)}>
        {['Invisible','Calm','Proactive','Ambitious','Kraken','Tsunami'].map(m=> <option key={m}>{m}</option>)}
      </select>
      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Your input" />
      <button onClick={runMode} disabled={!token}>Run</button>
      <pre>{result? JSON.stringify(result,null,2):''}</pre>
    </div>
    <div className="panel">
      <h2>Roles</h2>
      <button onClick={listRoles} disabled={!token}>Load sample</button>
    </div>
    <div className="panel">
      <h2>Kits</h2>
      <button onClick={buyKit}>Buy $9 Kit</button>
      <p>After payment, a PDF will be generated and available via a secure download link.</p>
    </div>
    <style jsx>{`
      .container{ width:86%; margin:2rem auto; }
      .panel{ height:72vh; overflow:auto; margin:1rem 0; padding:1rem; backdrop-filter: blur(8px); background: rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); border-radius:16px; }
      input,select{ display:block; margin:0.5rem 0; padding:0.5rem; width:100%; max-width:420px; }
      button{ padding:0.5rem 1rem; border-radius:10px; border:1px solid #ccc; background:#fff; cursor:pointer; }
      h1{ margin-bottom:0; }
    `}</style>
  </div>
}
