window.Kits=(function(){
  function showKitModal(){
    const div=document.createElement('div'); div.className='overlay';
    div.innerHTML = `<h3>Custom Kit — $9</h3>
      <div>Få ett‑klikk leveranser (plan, agenda, utkast, 3‑slides PDF).</div>
      <div class="actions">
        <button class="btn" id="buy">Kjøp • $9</button>
        <button class="btn-outline" id="later">Ikke nå</button>
      </div>`;
    document.body.appendChild(div);
    div.querySelector('#later').onclick=()=>div.remove();
    div.querySelector('#buy').onclick=()=>{
      div.remove();
      Stripe.checkout().then(()=>{
        Autonomy.generateSlidesPDF({
          title:'Renewal Brief',
          slide1_title:'Kunde & kontrakt',
          slide1_bullets:['ACME Inc.','Fornyelse 30 dager','Nåverdi: 120k'],
          slide2_title:'Mål for samtale',
          slide2_bullets:['Bekrefte behov','Oppgradere plan','Avklare risiko'],
          slide3_title:'Neste steg',
          slide3_bullets:['Send tilbud','Book demo','Oppfølging om 2 dager']
        });
      });
    };
  }
  return {showKitModal};
})();