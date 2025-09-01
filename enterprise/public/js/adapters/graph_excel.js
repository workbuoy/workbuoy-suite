window.GraphExcel=(function(){
  async function analyzeFormula(sheet){ return {improvement:'SUM over range', saving_sec:45}; }
  async function detectErrors(sheet){ return [{cell:'B14', code:'#N/A', fix:'VLOOKUP→XLOOKUP'}]; }
  async function applyFix(address, patch){ return {ok:true, address}; }
  return {analyzeFormula, detectErrors, applyFix};
})();