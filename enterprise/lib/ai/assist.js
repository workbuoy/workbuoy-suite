'use strict';
const { guardPrompt, guardAnswer } = require('./pii_guard');
const metrics = require('../metrics/registry');
async function callAI(prompt){
  const maskedPrompt = guardPrompt(prompt);
  if (prompt !== maskedPrompt){
    metrics.counters?.pii_masked?.inc?.();
  }
  // here would call external AI API
  const answer = "dummy response for: " + maskedPrompt;
  const maskedAnswer = guardAnswer(answer);
  if (answer !== maskedAnswer){
    metrics.counters?.pii_masked?.inc?.();
  }
  return maskedAnswer;
}
module.exports = { callAI };
