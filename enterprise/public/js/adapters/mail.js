window.Mail=(function(){
  async function draft(to, subject, body){ return {id:'draft_'+Date.now(), to, subject}; }
  async function send(id){ if(window.Secure.requireConfirm('send_email')){ return {pending:true, id}; } return {sent:true, id}; }
  return {draft, send};
})();