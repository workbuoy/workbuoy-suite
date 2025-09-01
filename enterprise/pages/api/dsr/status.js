export default async function handler(req,res){
  // For brevity we don't persist job state here; return stub
  res.json({ ok:true, status:'queued' });
}
