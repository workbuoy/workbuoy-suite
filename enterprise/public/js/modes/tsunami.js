(function(){
  // same as Kraken, but with overlay HUD always on & user choices
  function startHUD(){
    Overlay.show({content:{title:'Tsunami HUD',summary:'Autonom kjøring aktiv'}, suggestion:{actions:[{id:'pause',label:'Pause'},{id:'stop',label:'Stopp'}]}, live_feed:true});
    window.addEventListener('overlayAction', (e)=>{
      if(e.detail?.action?.id==='pause'){ window.dispatchEvent(new CustomEvent('overlayFeed',{detail:{text:'(pause)'}})); }
      if(e.detail?.action?.id==='stop'){ Overlay.close(); }
    }, {once:true});
  }
  EventBus.on('focus:apply', e=>{
    if((localStorage.getItem('wb.coreMode')||'proactive')!=='tsunami') return;
    startHUD();
  });
})();