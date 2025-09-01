(async function(){
  try {
    const snap = await window.wbDesktop.metricsSnapshot?.();
    document.getElementById('metrics').textContent = snap?.text || 'n/a';
  } catch(e) { document.getElementById('metrics').textContent = 'error'; }
})();
