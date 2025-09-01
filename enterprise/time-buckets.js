// Minimal DST-aware bucketing using Intl API (no extra deps)
export function hourBucket(date=new Date(), timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone){
  const d = (date instanceof Date) ? date : new Date(date);
  const parts = new Intl.DateTimeFormat('en-GB',{ timeZone, hour12:false, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit' }).formatToParts(d);
  const obj = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  // 2025-08-25T14
  return `${obj.year}-${obj.month}-${obj.day}T${obj.hour}`;
}
export function dowBucket(date=new Date(), timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone){
  const d = (date instanceof Date) ? date : new Date(date);
  const dayIndex = Number(new Intl.DateTimeFormat('en-GB',{ timeZone, weekday:'numeric' }).format(d)) || d.getUTCDay();
  return String(dayIndex); // 1..7 (locale dependent)
}
