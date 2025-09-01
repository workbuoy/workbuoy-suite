import fs from 'fs';
import path from 'path';

const SNAP_DIR = path.join(process.cwd(), '.wb_snapshots');

function ensureSnapDir(){ fs.mkdirSync(SNAP_DIR,{recursive:true}); }

export async function createSnapshot(label='auto'){
  ensureSnapDir();
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  const name = `snapshot_${ts}_${label}.zip`;
  const outPath = path.join(SNAP_DIR, name);
  const archiverMod = await import('archiver');
  const archiver = archiverMod.default || archiverMod;
  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  return await new Promise((resolve,reject)=>{
    output.on('close', ()=> resolve({ ok:true, file: outPath, bytes: archive.pointer() }));
    archive.on('error', reject);
    archive.pipe(output);
    archive.glob('**/*', {
      cwd: process.cwd(),
      ignore: ['node_modules/**','.wb_snapshots/**','.git/**']
    });
    archive.finalize();
  });
}

export function listSnapshots(){
  ensureSnapDir();
  return fs.readdirSync(SNAP_DIR).filter(f=>f.endsWith('.zip')).map(f=>({ file:f, path:path.join(SNAP_DIR,f) }));
}

export async function restoreSnapshot(file){
  ensureSnapDir();
  const fp = path.isAbsolute(file) ? file : path.join(SNAP_DIR, file);
  if(!fs.existsSync(fp)) throw new Error('Snapshot not found');
  const unzipperMod = await import('unzipper');
  const unzipper = unzipperMod.default || unzipperMod;
  return fs.createReadStream(fp).pipe(unzipper.Extract({ path: process.cwd() }));
}