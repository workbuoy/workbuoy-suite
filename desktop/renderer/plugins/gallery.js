(async function(){
  const r = await window.wbDesktop.pluginsList();
  const wrap = document.getElementById('list');
  (r.plugins||[]).forEach(async p=>{
    const card = document.createElement('div'); card.className='card';
    const t = document.createElement('div'); t.className='title'; t.textContent = `${p.name} (${p.key})`;
    const badge = document.createElement('span'); badge.className='badge'; badge.textContent = p.manifestStatus||'unknown';
    const tog = document.createElement('input'); tog.type='checkbox'; tog.checked = !!p.enabled;
    const btn = document.createElement('button'); btn.textContent='Health-check';
    const v = await window.wbDesktop.pluginsVerify({ key:p.key });
    if (!v.ok) { badge.textContent = (v.reason==='unsigned'?'Unsigned':'Invalid');  }
    else { badge.textContent = 'Verified';  }
    tog.onchange = async ()=>{
      const res = await window.wbDesktop.pluginsToggle({ key: p.key, enabled: !!tog.checked });
      if (!res.ok) { alert('Enable blocked: ' + (res.error||'invalid')); tog.checked = false; }
    };
    btn.onclick = async ()=>{ btn.disabled=true; const res = await window.wbDesktop.pluginsHealth({ key:p.key }); btn.disabled=false; alert(res.ok? 'OK' : (res.error||'Feil')); };
    card.appendChild(t); card.appendChild(badge); card.appendChild(tog); card.appendChild(btn); wrap.appendChild(card);
  });
})();
