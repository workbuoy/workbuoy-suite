window.Flex=(function(){
  async function runTemp(task){
    // scoped session, returns one artifact
    if(task==='excel:cleanup'){ return {type:'txt', content:'Renset 3 ark; 2 kolonner standardisert; 1 #N/A fikset.'}; }
    return {type:'txt', content:'Oppgave utført (demo).'};
  }
  async function runTempest(project){
    // mini‑prosjekt, returns bundle
    return {type:'bundle', items:[{type:'pdf', name:'slides.pdf'},{type:'txt', name:'checklist.txt'}]};
  }
  return {runTemp, runTempest};
})();