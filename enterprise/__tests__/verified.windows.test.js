import { execSync } from 'node:child_process';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(),'db','workbuoy.db');
function resetDb(){
  fs.mkdirSync(path.dirname(DB_PATH), { recursive:true });
  if(fs.existsSync(DB_PATH)) fs.rmSync(DB_PATH);
}

describe('verified learning windows', ()=>{
  beforeEach(()=> resetDb() );
  test('script runs without throwing when flag disabled', ()=>{
    expect(()=>execSync(`node scripts/verify-feedback.js`, { stdio:'pipe', env:{...process.env, DB_PATH, ENABLE_VERIFIED_LEARNING:'false'} })).not.toThrow();
  });
});
