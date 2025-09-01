import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';

export class DLQ {
  constructor({ redisUrl, filePath }={}){
    this.redisUrl = redisUrl || process.env.REDIS_URL;
    this.filePath = filePath || path.join(process.cwd(),'connectors','dynamics','dlq.json');
    if (this.redisUrl){
      this.redis = new Redis(this.redisUrl, { lazyConnect: true });
    }
  }
  async push(item){
    if (this.redis){
      try{
        if (!this.redis.status || this.redis.status === 'end') await this.redis.connect();
        await this.redis.lpush('wb:dyn:dlq', JSON.stringify(item));
        return;
      }catch(e){ /* fall back */ }
    }
    let arr = []; try { arr = JSON.parse(fs.readFileSync(this.filePath,'utf8')); } catch {}
    arr.push(item); fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(arr, null, 2));
  }
  async depth(){
    if (this.redis){
      try{ if (!this.redis.status || this.redis.status === 'end') await this.redis.connect(); return await this.redis.llen('wb:dyn:dlq'); }catch{}
    }
    try { return JSON.parse(fs.readFileSync(this.filePath,'utf8')).length; } catch { return 0; }
  }
}
