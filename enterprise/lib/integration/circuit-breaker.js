export class CircuitBreaker{
  constructor(name, opts={}){
    this.name=name; this.failures=0; this.state='CLOSED';
    this.threshold=opts.threshold??5; this.resetMs=opts.resetMs??30000; this.lastOpen=0; this.onOpen=opts.onOpen||(()=>{});
  }
  allow(){ if(this.state==='OPEN'){ if(Date.now()-this.lastOpen>this.resetMs){ this.state='HALF_OPEN'; return true; } return false; } return true; }
  success(){ if(this.state==='HALF_OPEN'){ this.state='CLOSED'; this.failures=0; } else { this.failures=0; } }
  failure(){ this.failures++; if(this.failures>=this.threshold && this.state!=='OPEN'){ this.state='OPEN'; this.lastOpen=Date.now(); this.onOpen(this.name); } }
  snapshot(){ return { name:this.name, state:this.state, failures:this.failures, threshold:this.threshold, lastOpen:this.lastOpen }; }
}
const _breakers = new Map();
export function getBreaker(name, opts){ if(!_breakers.has(name)) _breakers.set(name, new CircuitBreaker(name, opts)); return _breakers.get(name); }
export function snapshotAll(){ const o={}; for(const [k,b] of _breakers) o[k]=b.snapshot(); return o; }
export default { CircuitBreaker, getBreaker, snapshotAll };
