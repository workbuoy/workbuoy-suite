const nbDays = ["søn","man","tir","ons","tor","fre","lør"];
const enDays = ["sun","mon","tue","wed","thu","fri","sat"];

function pad(n:number){ return n<10 ? `0${n}` : `${n}`; }
function toISODate(d:Date){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

function nextDow(target:number, from = new Date()){
  const d = new Date(from);
  const diff = (target + 7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

export function parseNaturalDate(text:string): { date:string, time?:string } | null {
  const v = text.trim().toLowerCase();

  if (/(tomorrow|i morgen|imorgen)/.test(v)){
    const d = new Date(); d.setDate(d.getDate()+1);
    const m = v.match(/(\d{1,2})([:.]?(\d{2}))?/);
    let time: string | undefined;
    if (m){ const hh = m[1].padStart(2,"0"); const mm = (m[3]??"00").padStart(2,"0"); time = `${hh}:${mm}`; }
    return { date: toISODate(d), time };
  }

  const parts = v.split(/\s+/);
  if (parts.length >= 1){
    const day = parts[0].slice(0,3);
    let idx = nbDays.indexOf(day);
    if (idx === -1) idx = enDays.indexOf(day);
    if (idx !== -1){
      const d = nextDow(idx);
      const m = v.match(/(\d{1,2})([:.]?(\d{2}))?/);
      let time: string | undefined;
      if (m){ const hh = m[1].padStart(2,"0"); const mm = (m[3]??"00").padStart(2,"0"); time = `${hh}:${mm}`; }
      return { date: toISODate(d), time };
    }
  }

  const md = v.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/);
  if (md){
    const now = new Date();
    const day = parseInt(md[1],10);
    const month = parseInt(md[2],10);
    const year = md[3] ? parseInt(md[3],10) : now.getFullYear();
    const date = toISODate(new Date(year, month-1, day));
    const m = v.match(/(\d{1,2})([:.]?(\d{2}))?/);
    let time: string | undefined;
    if (m){ const hh = m[1].padStart(2,"0"); const mm = (m[3]??"00").padStart(2,"0"); time = `${hh}:${mm}`; }
    return { date, time };
  }

  return null;
}