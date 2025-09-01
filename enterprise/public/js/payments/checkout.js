// public/js/payments/checkout.js
(function(){
  const tabs = document.querySelectorAll('.tabs button');
  const tabEls = [...document.querySelectorAll('.tab')];
  tabs.forEach(btn=>btn.addEventListener('click',()=>{
    tabEls.forEach(t=>t.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  }));

  // Core flows
  document.querySelectorAll('[data-core]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const plan = btn.getAttribute('data-core');
      const res = await fetch('/api/billing/create-subscription', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ module:'core', plan, trialDays:7, successUrl: window.location.origin + '/app/core/welcome', cancelUrl: window.location.origin + '/pricing.html' })
      });
      const j = await res.json();
      if(j.url){ window.location.href = j.url; }
      else alert('Checkout failed');
    });
  });

  // Flex flows
  document.querySelectorAll('[data-flex]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const type = btn.getAttribute('data-flex'); // temp | tempest
      const amount = type==='temp' ? 25 : 199; // top of the ranges
      const res = await fetch('/api/billing/create-payment', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ module:'flex', taskType:type, amount })
      });
      const j = await res.json();
      if(j.url){ window.location.href = j.url; }
      else alert('Payment failed');
    });
  });

  // Secure
  const demo = document.getElementById('enterprise-demo');
  if(demo){
    demo.addEventListener('click', async ()=>{
      const email = localStorage.getItem('wb.email') || prompt('Work email for follow-up?');
      const company = prompt('Company?'); 
      const size = prompt('Company size (e.g. 100-500)?');
      const needs = 'SOC2,GDPR,HIPAA';
      await fetch('/api/enterprise-lead', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, company, size, compliance: needs }) });
      window.location.href = '/enterprise/demo-request.html';
    });
  }
})();