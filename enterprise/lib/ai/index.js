'use strict';
const { guardPrompt, guardAnswer } = require('./pii_guard');
const { histograms, counters, gauges, client } = require('../metrics/registry');

function maskStats(before, after){
  const masked = Math.max(0, (before.length - after.length));
  const ratio = before.length ? masked / before.length : 0;
  try {
    gauges?.ai_mask_ratio?.observe?.(ratio);
    counters?.ai_masked_chars_total?.inc?.(masked);
  } catch {}
}

// Example LLM call wrapper (pseudo): plug in your provider here
async function callLLM(prompt, provider){
  const safePrompt = guardPrompt(prompt);
  maskStats(prompt, safePrompt);
  const raw = await provider(safePrompt); // your actual LLM call
  const safeAnswer = guardAnswer(raw);
  maskStats(raw, safeAnswer);
  return safeAnswer;
}

module.exports = { callLLM };
