window.Autonomy=(function(){
  async function generateSlidesPDF(data){
    const tpl = await fetch('/templates/slides/3up.html').then(r=>r.text());
    const html = tpl
      .replaceAll('{{title}}', data.title||'WorkBuoy Slides')
      .replaceAll('{{slide1_title}}', data.slide1_title||'Slide 1')
      .replaceAll('{{slide2_title}}', data.slide2_title||'Slide 2')
      .replaceAll('{{slide3_title}}', data.slide3_title||'Slide 3')
      .replace('{{slide1_bullets}}', (data.slide1_bullets||[]).map(x=>`<li>${x}</li>`).join(''))
      .replace('{{slide2_bullets}}', (data.slide2_bullets||[]).map(x=>`<li>${x}</li>`).join(''))
      .replace('{{slide3_bullets}}', (data.slide3_bullets||[]).map(x=>`<li>${x}</li>`).join(''));
    const w=window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(()=>w.print(), 250);
  }
  function renewalBrief(account){
    return [
      `Kunde: ${account.name} (${account.city})`,
      `Status: ${account.status}; fornyelse om ${account.renewal_days} dager`,
      `Mål: sikre fornyelse, avdekke oppgraderingsmulighet`,
      `Agenda: 1) Behov, 2) Verdi, 3) Neste steg`
    ].join('\n• ');
  }
  return {generateSlidesPDF,renewalBrief};
})();