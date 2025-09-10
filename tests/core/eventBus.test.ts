import { EventBus } from '../../src/core/events/bus';

beforeEach(()=> EventBus.__reset());

test('idempotent publish', async () => {
  const hits: string[] = [];
  EventBus.subscribe('t', async e => { hits.push(e.id); });
  await EventBus.publish({ id:'1', type:'t', priority:'high', timestamp: new Date().toISOString(), payload:{} });
  await EventBus.publish({ id:'1', type:'t', priority:'high', timestamp: new Date().toISOString(), payload:{} });
  expect(hits).toEqual(['1']);
});

test('retry then DLQ after 3', async () => {
  let count = 0;
  EventBus.subscribe('boom', async () => {
    count++; throw new Error('fail');
  });
  await EventBus.publish({ id:'x', type:'boom', priority:'medium', timestamp:new Date().toISOString(), payload:{} });
  expect(EventBus.__dlq().find(d=>d.id==='x')).toBeTruthy();
  expect(count).toBeGreaterThanOrEqual(3);
});
