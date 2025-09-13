export default function SynchBadge({status}:{status:"ok"|"pending"|"error"}) {
  const map = { ok:["var(--ok)","Synk OK"], pending:["var(--warn)","Venter"], error:["var(--err)","Feil"] } as const;
  const [color,label] = map[status];
  return <span className="chip" style={{borderColor:color, color}}>{label}</span>
}