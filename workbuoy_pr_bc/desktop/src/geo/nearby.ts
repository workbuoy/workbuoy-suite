export function findNearby(lat: number, lng: number, points: {lat:number,lng:number,id:string}[], max=10){
  const dist = (a:any,b:any)=> Math.hypot(a.lat-b.lat,a.lng-b.lng);
  return points.map(p=>({...p,d:dist({lat,lng},p)})).sort((a,b)=>a.d-b.d).slice(0,max);
}
