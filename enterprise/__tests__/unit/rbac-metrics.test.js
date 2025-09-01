import { wbRbacDenied } from '../../lib/metrics/registry.js';
test('rbac metric exists', ()=>{ expect(wbRbacDenied).toBeTruthy(); });
