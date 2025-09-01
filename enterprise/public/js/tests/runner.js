(function(){
  function testFocusCardExists(){ return !!document.getElementById('focus-card'); }
  function testCXMTabExists(){ return !!document.getElementById('cxm-tabs'); }
  function run(){ const res=[['focus-card',testFocusCardExists()],['cxm-tabs',testCXMTabExists()]]; console.log('TESTS',res); alert('Tests: '+JSON.stringify(res)); }
  window.addEventListener('keydown', e=>{ if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.key.toLowerCase()==='t'){ e.preventDefault(); run(); } });
})();