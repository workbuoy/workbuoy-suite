import crypto from 'crypto';
export function sign(secret, payload){
  const ts = Math.floor(Date.now()/1000);
  const sig = crypto.createHmac('sha256', secret).update(ts + '.' + payload).digest('hex');
  return `t=${ts}, v1=${sig}`;
}
export default { sign };
