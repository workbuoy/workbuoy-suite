window.FLAGS=(function(){
  const o={ focus_preview_button: (localStorage.getItem('wb.flag.preview')||'A')==='A' };
  return o;
})();