// tests/bus.alias.test.ts
import busV2, { bus } from '../src/core/eventBusV2';
import busCompat from '../src/core/eventBus';
import prioCompat from '../src/core/events/priorityBus';
test('all bus imports resolve to the same instance surface', ()=>{
  expect(typeof bus.emit).toBe('function');
  expect(typeof busV2.emit).toBe('function');
  expect(typeof (busCompat as any).emit).toBe('function');
  expect(typeof (prioCompat as any).emit).toBe('function');
});
