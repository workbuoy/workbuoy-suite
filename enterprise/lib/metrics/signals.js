import client from 'prom-client';

const signalsEmitted = new client.Counter({
  name:'wb_signals_emitted_total',
  help:'Total signals emitted',
  labelNames:['type','source']
});
const signalsShown = new client.Counter({
  name:'wb_signals_shown_total',
  help:'Signals shown in UI',
  labelNames:['type']
});
const signalsActed = new client.Counter({
  name:'wb_signals_acted_total',
  help:'Signals acted on',
  labelNames:['type']
});
const signalsIgnored = new client.Counter({
  name:'wb_signals_ignored_total',
  help:'Signals ignored',
  labelNames:['type']
});

export { signalsEmitted, signalsShown, signalsActed, signalsIgnored };
