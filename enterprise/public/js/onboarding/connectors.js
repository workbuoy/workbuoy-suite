(function(){
  async function api(path, opts){ const r = await fetch(path, Object.assign({headers:{'Content-Type':'application/json'}},opts||{})); return r.json(); }
  function el(tag, cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e; }

  async function discover(email){
    try{ await api('/api/integrations/discover', {method:'POST', body: JSON.stringify({ email })}); }catch(e){}
  }

  async function fetchSuggested(){
    const r = await api('/api/integrations/suggested'); return (r && r.data && r.data.suggested) || [];
  }

  function row(item){
    const d = el('div','msg');
    d.innerHTML = `
      <div class="row">
        <div><strong>${item.label}</strong></div>
        <div class="chips">
          <span class="chip small ${item.status}">${item.status}</span>
          <button class="chip" data-act="connect">Koble til</button>
        </div>
      </div>
      <div class="small">Grunnlag: ${(item.reason||[]).join(', ')}</div>
    `;
    d.querySelector('[data-act=connect]').onclick=()=>connectOne(item.id, d);
    return d;
  }

  async function connectOne(provider, container){
    try{
      container.querySelector('.small').textContent = 'Starter tilkobling…';
      const r = await api('/api/integrations/connect', {method:'POST', body: JSON.stringify({provider})});
      const status = (r && r.data && r.data.status) || 'pending';
      const chip = container.querySelector('.chip.small'); chip.textContent=status; chip.className='chip small '+status;
      container.querySelector('.small').textContent = status==='connected' ? 'Tilkoblet' : 'Venter på godkjenning…';
    }catch(e){
      const chip = container.querySelector('.chip.small'); chip.textContent='failed'; chip.className='chip small failed';
      container.querySelector('.small').textContent = 'Feil under tilkobling';
    }
  }

  async function connectAll(list, root){
    for(const item of list){
      const node = root.querySelector(`[data-provider="${item.id}"]`);
      await connectOne(item.id, node);
    }
  }

  function renderOverlay(list){
    const wrap = el('div'); wrap.style.maxWidth='680px';
    const title = el('div','focus-title'); title.textContent='Koble til arbeidsverktøy';
    wrap.appendChild(title);
    const actions = el('div','row'); actions.style.margin='8px 0';
    const btnAll = el('button','chip'); btnAll.textContent='Koble til alle'; actions.appendChild(btnAll);
    wrap.appendChild(actions);
    const root = el('div'); wrap.appendChild(root);
    list.forEach(it=>{
      const r = row(it); r.setAttribute('data-provider', it.id); root.appendChild(r);
    });
    btnAll.onclick = ()=>connectAll(list, root);
    if(window.Overlay && Overlay.show){
      Overlay.show({ content:{ title:'Integrasjoner', body: wrap }, actions:[{id:'close',label:'Lukk'}] });
    }else{
      const host = document.getElementById('focus-card')||document.body; host.appendChild(wrap);
    }
  }

  async function init(){
    try{
      const email = (window.localStorage && localStorage.getItem('wb.userEmail')) || '';
      await discover(email);
      const list = await fetchSuggested();
      const hero = document.querySelector('.hero .hero-row') || document.body;
      const btn = el('button','chip'); btn.textContent = 'Integrasjoner'; btn.onclick=()=>renderOverlay(list);
      hero.appendChild(btn);
      if(window.EventBus && EventBus.emit){
        EventBus.emit({type:'integrations:suggested', count:list.length });
      }
    }catch(e){}
  }

  if(document.readyState==='complete' || document.readyState==='interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
