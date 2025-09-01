window.EventBus=(function(){
  const listeners=new Map(); const recent=[]; const MAX=400;
  function on(type,fn){ if(!listeners.has(type)) listeners.set(type,[]); listeners.get(type).push(fn); }
  function emit(evt){ recent.push(evt); if(recent.length>MAX) recent.shift(); (listeners.get(evt.type)||[]).forEach(fn=>fn(evt)); }
  function last(n=50){ return recent.slice(-n); }
  return {on,emit,last};
})();