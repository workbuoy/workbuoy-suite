window.Secure=(function(){
  let policy=null, on=false;
  async function init(){
    policy = await Policies.loadSecure();
    on = localStorage.getItem('wb.secureOn')==='1';
    const cb=document.getElementById('secureOn'); if(cb){ cb.checked=on; cb.addEventListener('change',()=>{on=cb.checked; localStorage.setItem('wb.secureOn', on?'1':'0');}); }
  }
  function isOn(){ return on; }
  function getPolicy(){ return policy||{}; }
  function maskText(t){ return Policies.mask(t, (on?{masking:true}:{})); }
  function requireConfirm(kind){ return (policy?.critical_actions||[]).includes(kind); }
  return {init,isOn,getPolicy,maskText,requireConfirm};
})();