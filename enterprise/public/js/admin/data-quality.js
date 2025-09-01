
(async function(){
  const tbody = document.querySelector('#suggestions tbody');
  const status = document.getElementById('status');
  const staleBadge = document.getElementById('stale');
  const all = document.getElementById('all');
  document.getElementById('refresh').onclick = load;
  document.getElementById('approve').onclick = approveSelected;
  all.addEventListener('change', ()=>{
    document.querySelectorAll('tbody input[type=checkbox]').forEach(cb=>cb.checked=all.checked);
  });

  async function load(){
    const r = await fetch('/api/data-quality/queue?status=pending,failed');
    if(!r.ok){ status.textContent = 'Failed to load'; return; }
    const data = await r.json();
    tbody.innerHTML = '';
    const now = Date.now();
    data.items.forEach(it=>{
      const stale = (now - new Date(it.created_at).getTime()) > 10*60*1000;
      if(stale) staleBadge.style.display = 'inline-block';
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><input type="checkbox" data-id="\${it.id}" /></td>
        <td>\${it.id}</td>
        <td>\${(it.confidence*100).toFixed(1)}%</td>
        <td class="why">\${(it.payload?.why||[]).join('; ')}</td>
        <td><pre>\${JSON.stringify(it.payload?.before, null, 2)}</pre></td>
        <td><pre>\${JSON.stringify(it.payload?.after, null, 2)}</pre></td>
        <td>\${it.status}</td>\`;
      tbody.appendChild(tr);
    });
    status.textContent = data.items.length + ' suggestion(s)';
  }

  async function approveSelected(){
    const ids = Array.from(document.querySelectorAll('tbody input[type=checkbox]:checked')).map(cb=>cb.getAttribute('data-id'));
    if(ids.length===0){ alert('Select at least one'); return; }
    const r = await fetch('/api/data-quality/approve', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization': localStorage.getItem('wb.token')? 'Bearer '+localStorage.getItem('wb.token'): ''}, body: JSON.stringify({ suggestion_ids: ids, approve: true }) });
    const data = await r.json();
    status.textContent = 'Applied: ' + data.applied.length + ', Failed: ' + data.failed.length;
    load();
  }

  load();
})();
