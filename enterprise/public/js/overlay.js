window.Overlay=(function(){
  let node=null;
  function show(spec){
    close();
    node=document.createElement('div'); node.className='overlay';
    node.innerHTML=`<h3>${spec.content?.title||'Buoy'}</h3>
      <div>${spec.content?.summary||''}</div><div class='banner'><b>Mode:</b> ${spec.content?.mode||''} &nbsp; <b>Signals:</b> ${spec.content?.signals||''} &nbsp; <b>Why:</b> ${spec.content?.why||''}</div>
      <div style="opacity:.8;font-size:12px;margin-top:6px">${spec.content?.explanation||''}</div>
      <div class="feed" id="ov-feed" style="display:${spec.live_feed?'block':'none'}"></div>
      <div class="actions" id="ov-actions"></div>`;
    document.body.appendChild(node);
    const wrap=node.querySelector('#ov-actions');
    (spec.suggestion?.actions||[]).forEach(a=>{
      const b=document.createElement('button'); b.className='btn'; b.textContent=a.label||a.id;
      b.onclick=()=>window.dispatchEvent(new CustomEvent('overlayAction',{detail:{action:a,spec}}));
      wrap.appendChild(b);
    });
  }
  function feed(text){
    if(!node) return; const f=node.querySelector('#ov-feed'); if(!f) return;
    const div=document.createElement('div'); div.textContent=text; f.appendChild(div); f.scrollTop=f.scrollHeight;
  }
  function close(){ if(node){ node.remove(); node=null; } }
  window.addEventListener('overlayFeed', e=>feed(e.detail?.text||''));
  return {show,close,feed};
})();