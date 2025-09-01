'use strict';
// Simple PII masker for prompts/answers: emails, phone, tokens
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
const PHONE_RE = /\+?[0-9][0-9\s\-]{7,}[0-9]/g;
const TOKEN_RE = /(sk|pk|eyJ)[A-Za-z0-9_\-]{10,}/g;
function mask(s){
  return String(s || '')
    .replace(EMAIL_RE, '[email]')
    .replace(PHONE_RE, '[phone]')
    .replace(TOKEN_RE, '[secret]');
}
function guardPrompt(p){ return mask(p); }
function guardAnswer(a){ return mask(a); }
module.exports = { guardPrompt, guardAnswer };
