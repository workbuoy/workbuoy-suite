import { KnowledgeIndex } from './base';
import fs from 'fs';
export class FileKnowledgeIndex implements KnowledgeIndex {
  private file: string;
  private cache: Record<string, any[]> = {};
  constructor(fname='knowledge.json'){ this.file=fname; this.load(); }
  private load(){ try{ this.cache = JSON.parse(fs.readFileSync(this.file,'utf-8')); }catch{ this.cache={}; } }
  private save(){ fs.writeFileSync(this.file, JSON.stringify(this.cache,null,2)); }
  async search(q:string){ 
    if(this.cache[q]) return { results:this.cache[q] };
    const res:any[] = []; 
    this.cache[q]=res; this.save(); return { results:res };
  }
}
