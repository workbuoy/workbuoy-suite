window.Policies=(function(){
  async function loadJSON(path){ const r=await fetch(path); return r.json(); }
  async function loadCore(){ return loadJSON('/config/core.config.json'); }
  async function loadSecure(){ return loadJSON('/config/secure.policy.json'); }
  async function loadFlex(){ return loadJSON('/config/flex.config.json'); }
  function score(event, roleWeights){
    const ts = new Date(event.ts||Date.now()).getTime();
    const ageMin = (Date.now()-ts)/60000;
    const decay = Math.max(0, 1 - (ageMin/240));
    const urgency = event.urgency ?? 0.5;
    const impact = event.impact ?? 0.5;
    const roleW = roleWeights?.[event.type] ?? 1.0;
    return (0.5*urgency + 0.5*impact) * decay * roleW;
  }
  function mask(text, secure){
    if(!secure?.masking) return String(text);
    let t = String(text);
    t = t.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,'[email]');
    t = t.replace(/\b\+?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{2,4}\b/g,'[phone]');
    return t;
  }
  function getCoreMode(){ return localStorage.getItem('wb.coreMode') || 'proactive'; }
  function setCoreMode(m){ localStorage.setItem('wb.coreMode', m); }
  return {loadCore,loadSecure,loadFlex,score,mask,getCoreMode,setCoreMode};
})();