window.MetaLearn=(function(){
  function record(evt){ const k='wb.telemetry'; const v=JSON.parse(localStorage.getItem(k)||'{"events":[]}'); v.events.push({...evt, t:Date.now()}); localStorage.setItem(k, JSON.stringify(v)); }
  function summary(){ const v=JSON.parse(localStorage.getItem('wb.telemetry')||'{"events":[]}'); return {count:v.events.length}; }
  return {record, summary};
})();