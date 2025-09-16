import { bus } from '../src/core/eventBusV2';
import compat from '../src/core/eventBus';
import prio from '../src/core/events/priorityBus';

test('all bus imports expose emit/on/stats', ()=>{
  [bus, compat, prio].forEach(b=>{
    expect(typeof b.emit).toBe('function');
    expect(typeof b.on).toBe('function');
    expect(typeof b.stats).toBe('function');
  });
});
