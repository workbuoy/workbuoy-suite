export default async function handler(req,res){
  if(req.method==='OPTIONS'){ res.setHeader('Access-Control-Allow-Origin','*'); res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS'); res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization'); return res.status(204).end(); }
  res.setHeader('Access-Control-Allow-Origin','*');
  const {messages=[], context={}} = req.body||{};
  const step = (context?.demoStep||0)+1;
  return res.json({reply:'(demo) Kort, vennlig, handlingsorientert svar.', chips:['Plan','Agenda','Utkast'], step, policy:{allowKitPitch:false,maxAutoActions:0,locale:'no-NO'}, telemetryId:'demo-'+Date.now()});
}