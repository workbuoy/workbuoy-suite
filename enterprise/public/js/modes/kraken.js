(function(){
  // full autonomy via adapters, stop only at critical
  async function runPlaybook(pb, ctx){
    window.dispatchEvent(new CustomEvent('overlayFeed',{detail:{text:`Starter playbook: ${pb.title||pb.id}`}}));
    for(const step of pb.steps||[]){
      window.dispatchEvent(new CustomEvent('overlayFeed',{detail:{text:`Steg: ${step.kind}`}}));
      if(step.kind==='excel_fix'){
        const errs = await GraphExcel.detectErrors(step.sheet||{});
        for(const e of errs){ await GraphExcel.applyFix(e.cell, {type:'xlookup'}); }
      }
      if(step.kind==='email_followups'){
        const d = await Mail.draft(step.to||'customer@ex.com', step.subject||'Oppfølging', step.body||'Hei ...');
        if(!window.Secure.requireConfirm('send_email')) await Mail.send(d.id);
      }
      window.dispatchEvent(new CustomEvent('overlayFeed',{detail:{text:`Utført: ${step.kind}`}}));
    }
    return {ok:true};
  }
  window.Kraken = {runPlaybook};
})();