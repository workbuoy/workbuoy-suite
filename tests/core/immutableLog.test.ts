import { append, verify, __reset, __all } from '../../src/core/audit/immutableLog';

beforeEach(()=> __reset());

test('verifies intact chain', () => {
  append({ id:'1', timestamp:new Date().toISOString(), component:'core', level:'audit', message:'a' });
  append({ id:'2', timestamp:new Date().toISOString(), component:'core', level:'audit', message:'b' });
  expect(verify()).toBe(true);
});

test('detects tampering', () => {
  append({ id:'1', timestamp:'t', component:'core', level:'audit', message:'a' });
  const arr: any[] = __all() as any;
  arr[0].message = 'changed';    // simulate tamper
  expect(verify()).toBe(false);
});
