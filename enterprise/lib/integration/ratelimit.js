export class TokenBucket {
  constructor({ tokensPerInterval=10, intervalMs=1000 }){
    this.capacity=tokensPerInterval; this.tokens=tokensPerInterval; this.intervalMs=intervalMs;
    this.lastRefill=Date.now();
  }
  take(){
    this.refill();
    if(this.tokens>0){ this.tokens--; return true; }
    return false;
  }
  refill(){
    const now=Date.now();
    const delta = Math.floor((now-this.lastRefill)/this.intervalMs);
    if(delta>0){
      this.tokens=Math.min(this.capacity, this.tokens+delta*this.capacity);
      this.lastRefill=now;
    }
  }
}
export default { TokenBucket };
