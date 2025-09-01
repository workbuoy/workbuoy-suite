window.MetaSelf=(function(){
  async function scan(){
    // very light: list loaded scripts and recent EventBus events
    const scripts=[...document.querySelectorAll('script')].map(s=>s.getAttribute('src')).filter(Boolean);
    const events=EventBus.last(20);
    return {scripts, events};
  }
  return {scan};
})();