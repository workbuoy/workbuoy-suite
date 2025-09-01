import fs from 'fs';
import path from 'path';

function walk(dir, acc=[]){
  for(const entry of fs.readdirSync(dir, { withFileTypes:true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()){
      if(['node_modules','.wb_snapshots','.git'].includes(entry.name)) continue;
      walk(full, acc);
    }else{
      acc.push(full);
    }
  }
  return acc;
}

export function analyzeProject(root=process.cwd()){
  const files = walk(root);
  const stats = {
    totalFiles: files.length,
    jsFiles: files.filter(f=>f.endsWith('.js')).length,
    tsFiles: files.filter(f=>f.endsWith('.ts')).length,
    mdFiles: files.filter(f=>f.endsWith('.md')).length,
    bigFiles: [],
    todos: 0,
    fixmes: 0
  };
  for(const f of files){
    if(fs.statSync(f).size > 64*1024) stats.bigFiles.push({ file: f, kb: Math.round(fs.statSync(f).size/1024) });
    if(/\.(js|ts|md|json)$/.test(f)){
      const txt = fs.readFileSync(f,'utf8');
      stats.todos += (txt.match(/TODO/gi)||[]).length;
      stats.fixmes += (txt.match(/FIXME/gi)||[]).length;
    }
  }
  return stats;
}