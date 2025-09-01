window.MetaGen=(function(){
  function proposal(){
    return {
      id:'patch-'+Date.now(),
      goal:'Legg til Preview-knapp i Focus Card for høyere apply‑rate',
      changes:[{file:'public/js/focusCard.js', hint:'preview button injection'}],
      risk:'low', why:'Brukere klikker forslag men avbryter; preview kan øke konvertering.'
    };
  }
  return {proposal};
})();