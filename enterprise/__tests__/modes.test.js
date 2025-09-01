const { handleMode, Proactivity } = require('../lib/modes.js');

test('calm mode echoes input', ()=>{
  const out = handleMode({mode: Proactivity.CALM, input:'hi', context:{}, user:{}});
  expect(out.reply).toMatch(/hi/);
  expect(out.executed).toBe(false);
});
