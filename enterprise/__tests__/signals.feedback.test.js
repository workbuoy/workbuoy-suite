import { adjustScoreByLearning, recordFeedback } from '../../lib/signals.learning.js';

test('learning adjusts score with feedback', ()=>{
  const user_id='u1';
  const base = 0.6;
  for(let i=0;i<5;i++) recordFeedback({user_id, signal_id:String(i), type:'analytics:target_gap', action:'acted'});
  const adj = adjustScoreByLearning({user_id, signal_type:'analytics:target_gap', baseScore:base});
  expect(adj).toBeGreaterThan(base);
});
