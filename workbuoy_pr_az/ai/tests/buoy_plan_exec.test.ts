// pseudo-test
import { planAndExecute } from '../buoy/plan_and_call';
test('plan+exec uses allowlist', async () => {
  const intent = { method:'GET', path:'/api/v1/crm/contacts' };
  // expect no throw on allow; mocked runTool would be used in real test
});
