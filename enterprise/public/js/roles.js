window.Roles=(function(){
  let current=null;
  async function load(roleId){
    try{ const r = await fetch('/data/roles/'+roleId+'.json'); current = await r.json(); return current; }
    catch(e){ current=null; return null; }
  }
  function get(){ return current; }
  function assists(){ return (current?.ai_assists||[]).slice(0,6); }
  function weights(){ const w={}; (current?.event_hooks||[]).forEach(t=>w[t]=1.3); return w; }
  return {load,get,assists,weights};
})();