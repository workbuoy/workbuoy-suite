window.Stripe=(function(){
  async function checkout(){ return new Promise(res=>setTimeout(res,600)); }
  return {checkout};
})();