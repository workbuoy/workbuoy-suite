import { auditLog, auditVerifyChain } from '../../lib/audit.js';

test('audit hash chain verifies', async ()=>{
  auditLog({ user_email:'test@x', action:'unit:test', details:{ a:1 } });
  const res = await auditVerifyChain();
  expect(res.ok).toBeTruthy();
});
