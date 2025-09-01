window.CRM=(function(){
  async function updateAccount(id, patch){ return {ok:true, id, patch}; }
  return {updateAccount};
})();