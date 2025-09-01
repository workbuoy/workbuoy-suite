// public/js/onboarding/registration.js
(function(){
  const s1 = document.getElementById('s1');
  const s2 = document.getElementById('s2');
  const s3 = document.getElementById('s3');
  const s4 = document.getElementById('s4');
  let selectedModule = null;
  const msg = (t)=>{ const el = document.getElementById('msg'); if(el) el.textContent = t; };

  // module cards
  document.querySelectorAll('.card[data-module]').forEach(card=>{
    card.addEventListener('click', ()=>{
      document.querySelectorAll('.card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      selectedModule = card.getAttribute('data-module');
      localStorage.setItem('wb.selectedModule', selectedModule);
    });
  });
  document.getElementById('next1').addEventListener('click', ()=>{
    if(!selectedModule){ alert('Pick a module to continue'); return; }
    s1.classList.remove('active'); s2.classList.add('active');
    fetch('/public/data/roles.json').then(r=>r.json()).then(list=>{
      const sel = document.getElementById('role'); sel.innerHTML = '<option value="">Choose role…</option>' + list.map(r=>`<option value="${r.role_id}">${r.title}</option>`).join('');
    });
    fetch('/api/metrics?ev=onboarding_started').catch(()=>{});
  });
  document.getElementById('back1').addEventListener('click', (e)=>{ e.preventDefault(); s2.classList.remove('active'); s1.classList.add('active'); });

  document.getElementById('next2').addEventListener('click', ()=>{
    const role = document.getElementById('role').value || document.getElementById('roleFree').value || '';
    if(!role){ alert('Select or type a role'); return; }
    localStorage.setItem('wb.roleId', role);
    s2.classList.remove('active'); s3.classList.add('active');
  });
  document.getElementById('skipIntegr').addEventListener('click', (e)=>{ e.preventDefault(); s3.classList.remove('active'); s4.classList.add('active'); });
  document.getElementById('next3').addEventListener('click', ()=>{ s3.classList.remove('active'); s4.classList.add('active'); });

  document.getElementById('regForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      company: document.getElementById('company').value || '',
      selected_module: selectedModule || localStorage.getItem('wb.selectedModule'),
      role_id: localStorage.getItem('wb.roleId') || document.getElementById('roleFree').value
    };
    try{
      const r = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const j = await r.json();
      if(!r.ok){ throw new Error(j.error||'Registration failed'); }
      localStorage.setItem('wb.token', j.token || '');
      fetch('/api/metrics?ev=onboarding_completed').catch(()=>{});
      window.location.href = '/pricing.html';
    }catch(err){
      msg(err.message);
    }
  });
})();