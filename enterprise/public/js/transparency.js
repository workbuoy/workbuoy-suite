(function(){
  function ensureBanner(){
    let el = document.getElementById('wb-transparency');
    if(el) return el;
    el = document.createElement('div');
    el.id = 'wb-transparency';
    el.style.position='fixed';
    el.style.bottom='12px';
    el.style.right='12px';
    el.style.backdropFilter='blur(6px)';
    el.style.background='rgba(255,255,255,0.6)';
    el.style.border='1px solid rgba(255,255,255,0.4)';
    el.style.boxShadow='0 6px 24px rgba(0,0,0,0.12)';
    el.style.borderRadius='14px';
    el.style.padding='8px 12px';
    el.style.fontSize='12px';
    el.style.zIndex='9999';
    document.body.appendChild(el);
    return el;
  }
  const signals = new Set();
  const banner = ensureBanner();
  function update(){
    const mode = localStorage.getItem('wb.coreMode') || 'proactive';
    banner.textContent = `Mode: ${mode} / Signals used: ${signals.size}`;
  }
  update();
  window.addEventListener('storage', update);
  // Listen to EventBus
  if(window.EventBus && EventBus.on){
    EventBus.on = EventBus.on || function(){};
    const origEmit = EventBus.emit;
    EventBus.emit = function(evt){
      try{
        const t = (evt && (evt.type || evt.action)) || '';
        if(t) signals.add(t);
        update();
      }catch(e){}
      return origEmit.apply(EventBus, arguments);
    };
  }
  setInterval(update, 1500);
})();
// CXM Intelligence HUD: Top-3 signals
(async function(){
  async function fetchTopSignals(){
    try{
      const r = await fetch('/api/focus/signals');
      const json = await r.json();
      if(json && json.data && Array.isArray(json.data)){
        const el = document.getElementById('wb-transparency');
        if(!el) return;
        const lines = json.data.slice(0,3).map(s=>`<li>${s.title} <em>(${(s.score*100)|0})</em> — <small>${(s.why||[]).join(',')} | ${s.since}</small></li>`).join('');
        const id='wb-top-signals';
        const ul = `<ul id="${id}">${lines}</ul>`;
        const html = el.innerHTML;
        if(html.indexOf(id)>=0){
          el.innerHTML = html.replace(/<ul id="wb-top-signals">[\s\S]*?<\/ul>/, ul);
        }else{
          el.innerHTML = html + ul;
        }
      }
    }catch(e){}
  }
  setInterval(fetchTopSignals, 5000);
  fetchTopSignals();
})();
