import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export default function MapPage(){
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map|null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(()=>{
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
    if(!token) return;
    (mapboxgl as any).accessToken = token;
    if(mapRef.current && !mapInstance.current){
      mapInstance.current = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [10.75, 59.91], zoom: 3
      });
    }
  },[]);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    fetch('/api/ai/ask',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({q: '/kart ' + q})})
      .then(r=>r.json()).then(async data=>{
        let res = data.results || [];
        // enrich geocode if missing
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
        const needGeo = res.filter((r:any)=>!r.geo);
        if(token && needGeo.length>0){
          for(const r of needGeo){
            const gr = await fetch('/api/geo/geocode',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({q: r.title})}).then(r=>r.json()).catch(()=>({results:[]}));
            if(gr.results && gr.results[0]) r.geo = gr.results[0].geo;
          }
        }
        setItems(res);
      });
  },[]);

  useEffect(()=>{
    const map = mapInstance.current;
    if(!map) return;
    // Clear existing markers by recreating map source/layer
    const feats = items.filter(i=>i.geo).map((i:any)=>({type:'Feature', properties:{title:i.title}, geometry:{type:'Point', coordinates:[i.geo.lng,i.geo.lat]}}));
    const fc = { type:'FeatureCollection', features: feats } as any;
    if(map.getSource('wb_points')){
      (map.getSource('wb_points') as any).setData(fc);
    } else {
      map.on('load', ()=>{
        map.addSource('wb_points', { type:'geojson', data: fc, cluster:true, clusterRadius:40 });
        map.addLayer({ id:'clusters', type:'circle', source:'wb_points', filter:['has','point_count'],
          paint:{ 'circle-radius': 18, 'circle-color':'#1976D2' }});
        map.addLayer({ id:'cluster-count', type:'symbol', source:'wb_points', filter:['has','point_count'],
          layout:{ 'text-field':['get','point_count_abbreviated'], 'text-size':12 }});
        map.addLayer({ id:'unclustered', type:'circle', source:'wb_points', filter:['!', ['has','point_count']],
          paint:{ 'circle-radius': 6, 'circle-color':'#11b4da' }});
      });
    }
    // Fit bounds
    if(feats.length){
      const b = new mapboxgl.LngLatBounds();
      feats.forEach((f:any)=>b.extend(f.geometry.coordinates as any));
      map.fitBounds(b, { padding: 40, duration: 800 });
    }
  },[items]);

  return (
    <div style={{display:'grid', gridTemplateColumns:'360px 1fr', height:'100vh'}}>
      <div style={{overflow:'auto', borderRight:'1px solid #eee', padding:12}}>
        <h2>Treff</h2>
        {items.map((it, idx)=>(
          <div key={idx} style={{border:'1px solid #eee', padding:8, borderRadius:8, marginBottom:8}}>
            <div style={{fontWeight:600}}>{it.title}</div>
            {it.geo && <div style={{fontSize:12}}>lat {it.geo.lat.toFixed(4)}, lng {it.geo.lng.toFixed(4)}</div>}
          </div>
        ))}
      </div>
      <div ref={mapRef} style={{width:'100%', height:'100%'}} />
    </div>
  );
}
