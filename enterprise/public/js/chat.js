(function(){
  const logEl=document.getElementById('chat-log'); const input=document.getElementById('chat-input'); const sendBtn=document.getElementById('send-btn'); const chipsEl=document.getElementById('chips');
  const modeSel=document.getElementById('coreMode'); let msgCount=0, kitShown=localStorage.getItem('wb.kitPitchShown')==='1';
  async function initCoreModes(){
    const modes = await fetch('/config/core.config.json').then(r=>r.json());
    modeSel.innerHTML = modes.map(m=>`<option value="${m.id}">${m.label}</option>`).join('');
    const saved = localStorage.getItem('wb.coreMode') || 'proactive'; modeSel.value=saved;
    modeSel.onchange = ()=>localStorage.setItem('wb.coreMode', modeSel.value);
  }
  function add(from,text){ const d=document.createElement('div'); d.className='msg'; d.innerHTML='<strong>'+from+':</strong> '+Secure.maskText(text); logEl.appendChild(d); logEl.scrollTop=logEl.scrollHeight; }
  function replyFor(text){
    const m = (localStorage.getItem('wb.coreMode')||'proactive');
    if(m==='invisible') return '(Usynlig) — ingen forslag.';
    if(m==='calm') return 'Jeg svarer når du spør — hva trenger du?';
    if(text.toLowerCase().includes('brief')) return 'Her er en kort fornyelses‑brief. Skal jeg lage agenda også?';
    if(text.toLowerCase().includes('agenda')) return 'Agenda kl. 14:00: 1) Behov 2) Verdi 3) Neste steg — vil du ha e‑postutkast etterpå?';
    return 'Notert. Vil du ha plan eller utkast?';
  }
  async function send(){
    const text=input.value.trim(); if(!text) return;
    MetaLearn.record({type:'chat_send', len:text.length});
    add('Du', text); input.value=''; msgCount++;
    const reply = replyFor(text);
    add('Buoy', reply);
    if(!kitShown && msgCount>=14){ kitShown=true; localStorage.setItem('wb.kitPitchShown','1'); Kits.showKitModal(); }
  }
  async function sendQuick(text){
    input.value = text; await send();
    if(text.toLowerCase().includes('fornyelses-brief')){
      const acct = window.__lastAccount || {name:'ACME Inc.', city:'Bergen', status:'Warm', renewal_days:30};
      add('Buoy', 'Ferdig — her er utkastet:\n• '+Autonomy.renewalBrief(acct));
    }
    if(text.toLowerCase().includes('agenda')){
      add('Buoy','Agenda (15 min)\n1) Status & mål\n2) Behov / Verdi\n3) Avtalt neste steg');
    }
  }
  window.Chat = {sendQuick};
  sendBtn.onclick=send;
  input.addEventListener('keydown',e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); }});
  Secure.init(); initCoreModes();
})();