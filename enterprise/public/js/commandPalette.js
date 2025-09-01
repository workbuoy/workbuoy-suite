(function(){
  window.addEventListener('keydown', e=>{
    if((e.metaKey||e.ctrlKey) && e.shiftKey && e.key.toLowerCase()==='p'){
      e.preventDefault(); document.getElementById('chat-input').focus();
    }
  });
})();