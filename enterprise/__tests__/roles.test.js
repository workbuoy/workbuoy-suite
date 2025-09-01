const fs = require('fs');
const path = require('path');

test('roles.json exists and is valid', ()=>{
  const p = path.join(process.cwd(),'data','roles','roles.json');
  const raw = fs.readFileSync(p,'utf8');
  const arr = JSON.parse(raw);
  expect(Array.isArray(arr)).toBe(true);
  expect(arr.length).toBeGreaterThanOrEqual(700);
  for(const r of arr){
    expect(r.role_id).toBeTruthy();
    expect((r.kpis||[]).length).toBeGreaterThan(0);
    expect((r.stakeholders_internal||[]).length).toBeGreaterThan(0);
    expect((r.stakeholders_external||[]).length).toBeGreaterThan(0);
  }
});
