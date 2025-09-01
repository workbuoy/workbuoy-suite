export default async function handler(req,res){
  const { id } = req.query || {};
  // In dev, we cannot query Stripe without the real key and expanded line items.
  // This endpoint simply checks if any generated file exists recently.
  // For production, replace with a secure lookup mapping session id -> purchase row.
  try{
    // naive scan for files in /public/downloads
    const fs = await import('fs');
    const path = await import('path');
    const dir = path.join(process.cwd(),'public','downloads');
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    if(files.length){
      const token = files[0].replace('.pdf','');
      return res.json({ download: '/api/kits/download?token='+token });
    }
    return res.json({ message: 'PDF not generated yet. Ensure webhook is configured.' });
  }catch(e){
    return res.status(500).json({error:'lookup_failed'});
  }
}
