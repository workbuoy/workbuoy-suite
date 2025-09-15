// src/core/persist/fileRepo.ts
import { promises as fs } from 'fs';
import * as path from 'path';
export class FileRepo<T extends { id: string }> {
  private file: string; private cache: T[] | null = null;
  constructor(filename: string, private dir = path.resolve(process.cwd(), 'data')) {
    this.file = path.join(this.dir, filename);
  }
  private async ensure(){ await fs.mkdir(this.dir,{recursive:true}); try{ await fs.access(this.file);}catch{ await fs.writeFile(this.file,'[]','utf8'); } }
  private async load(){ if(this.cache) return this.cache; await this.ensure(); const raw=await fs.readFile(this.file,'utf8'); this.cache=JSON.parse(raw) as T[]; return this.cache; }
  private async flush(){ if(!this.cache) return; await fs.writeFile(this.file, JSON.stringify(this.cache,null,2), 'utf8'); }
  async all(){ return (await this.load()).slice(); }
  async get(id:string){ return (await this.load()).find(x=>x.id===id); }
  async upsert(obj:T){ const list=await this.load(); const i=list.findIndex(x=>x.id===obj.id); if(i===-1) list.push(obj); else list[i]=obj; await this.flush(); return obj; }
  async remove(id:string){ const list=await this.load(); const len=list.length; this.cache=list.filter(x=>x.id!==id); const changed=this.cache.length!==len; if(changed) await this.flush(); return changed; }
}
