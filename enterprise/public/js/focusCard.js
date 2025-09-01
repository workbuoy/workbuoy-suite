(function(){
  const list=document.getElementById('focus-suggestions');
  function why(evt){
    if(evt.type==='crm:renewal_due') return 'Fornyelse nærmer seg; høy churn‑risiko uten oppfølging.';
    if(evt.type==='crm:deal_stuck') return 'Sak har stått stille; anbefaler neste steg.';
    if(evt.type.startsWith('planner')) return 'Frist nær; forbered før møtet.';
    if(evt.type.startsWith('excel')) return 'Oppdaget mønster/feil i regneark.';
    return 'Relevant signal i kontekst.';
  }
  function rebuild(){
    const roleW = Roles.weights();
    const events=EventBus.last(80);
    const ranked = events.map(e=>({e,score:Policies.score(e, roleW)})).sort((a,b)=>b.score-a.score).slice(0,3);
    list.innerHTML='';
    ranked.forEach(({e})=>{
      const d=document.createElement('div'); d.className='msg';
      const title = e.title || (e.type.replace(':',' • '));
      const because = 'Jeg foreslår dette fordi: ' + why(e);
      const previewBtn = window.FLAGS.focus_preview_button ? '<button class="btn-outline" data-act="preview">Preview</button>' : '';
      d.innerHTML = `<div><strong>${title}</strong></div><div style="opacity:.8;font-size:12px">${because}</div><div style="margin-top:8px;display:flex;gap:8px"><button class="btn" data-act="apply">Bruk</button>${previewBtn}</div>`;
      d.querySelector('[data-act=apply]').onclick=()=>{
        EventBus.emit({type:'focus:apply', payload:e});
      };
      if(window.FLAGS.focus_preview_button){
        d.querySelector('[data-act=preview]').onclick=()=>{
          Overlay.show({content:{title:title,summary:e.summary||'',explanation:because}, suggestion:{actions:[{id:'apply',label:'Apply'},{id:'reject',label:'Reject'}]}, live_feed:false});
        };
      }
      list.appendChild(d);
    });
  }
  ['crm:renewal_due','crm:deal_stuck','planner:deadline_today','excel:formula_detected','excel:error_detected'].forEach(t=>EventBus.on(t,rebuild));
  EventBus.on('focus:refresh', rebuild);
  setInterval(rebuild, 3000);
})();