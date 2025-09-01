export default async function handler(req, res){
  if(req.method!=='POST'){ return res.status(405).end(); }
  try {
    const { q } = req.body || {};
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if(!token){ return res.status(400).json({error:'missing_mapbox_token'}); }
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}`;
    const r = await fetch(url).then(r=>r.json());
    const features = (r.features||[]).map(f=>({ title: f.place_name, geo: { lat: f.center[1], lng: f.center[0] } }));
    res.status(200).json({ results: features });
  } catch (e){
    res.status(500).json({error:'geocode_failed'});
  }
}
