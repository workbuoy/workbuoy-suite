(function(){
  const tabs=['CRM','Analytics','Planner','News','Finance','Procurement','Projects'];
  const tabsEl=document.getElementById('cxm-tabs'); const body=document.getElementById('cxm-body');
  function btn(label){ const b=document.createElement('button'); b.className='chip'; b.textContent=label; return b; }
  tabs.forEach(t=>{ const b=btn(t); b.onclick=()=>select(t); tabsEl.appendChild(b); });

  async function select(t){
    if(t==='Finance'){ await renderModule('/api/cxm/finance', d=>{
      return `<div class="msg"><strong>MRR:</strong> ${d.mrr} — <strong>Burn:</strong> ${d.burn} — <strong>Cash:</strong> ${d.cash_on_hand}</div>`;
    }); }
    else if(t==='Procurement'){ await renderModule('/api/cxm/procurement', d=>{
      const rfqs = d.rfqs.map(r=>`<li>${r.id}: ${r.item} — ${r.status} (${r.bids} bud)</li>`).join('');
      const sl = d.shortlist.map(v=>`<li>${v.vendor}: ${v.score}</li>`).join('');
      return `<div class="msg"><strong>RFQs</strong><ul>${rfqs}</ul><strong>Shortlist</strong><ul>${sl}</ul></div>`;
    }); }
    else if(t==='Analytics'){ await renderModule('/api/cxm/analytics', d=>{
      const k = d.kpis.map(k=>`<div class="kpi">${k.name}: ${k.value}</div>`).join('');
      return `<div class="msg">${k}</div>`;
    }); }
    else if(t==='News'){ await renderModule('/api/cxm/news', d=>{
      const items = d.items.map(n=>`<li>${n.ts}: ${n.title} <em>(${n.source})</em></li>`).join('');
      return `<div class="msg"><strong>Company feed</strong><ul>${items}</ul></div>`;
    }); }
    else if(t==='CRM'){
      const r=await fetch('/assets/data/crm.json'); const data=await r.json();
      body.innerHTML = data.accounts.map(a=>`<div class="msg crm-row" data-id="${a.id}">${a.name} — ${a.industry} — ${a.status} — renewal: ${a.renewal_days}d</div>`).join('');
      body.querySelectorAll('.crm-row').forEach(row=>row.onclick=()=>{
        const id=row.getAttribute('data-id'); const acct=data.accounts.find(x=>x.id===id);
        window.__lastAccount = acct;
        const evt={type:'crm:renewal_due', ts:new Date().toISOString(), urgency:.9, impact:.8, title:'Forbered fornyelsessamtale', account:acct};
        EventBus.emit(evt);
        const chips=document.getElementById('chips'); chips.innerHTML='';
        ['Lag fornyelses-brief','Lag agenda for samtale','Utkast til oppfølging'].forEach(c=>{
          const el=document.createElement('div'); el.className='chip'; el.textContent=c; el.onclick=()=>window.Chat?.sendQuick(c); chips.appendChild(el);
        });
      });
    } else {
      body.innerHTML = '<div class="msg">Viser '+t+' (demo)</div>';
      if(t==='Planner'){ EventBus.emit({type:'planner:deadline_today', ts:new Date().toISOString(),urgency:.8,impact:.6,title:'Møte kl. 14:00—lag agenda'}); }
    }
  }

  async function renderModule(url, tpl){
    body.innerHTML = '<div class="msg">Henter data…</div>';
    const r = await fetch(url); const json = await r.json();
    body.innerHTML = tpl(json.data);
    // Show topp-level signal chip area (already exists)
  }

  select('CRM');
})();
