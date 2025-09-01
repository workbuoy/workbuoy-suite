import client from 'prom-client';
export const config = { api: { bodyParser: true } };

function getOrCreateCounter(){
  const name='wb_crm_ai_suggestions_total';
  const existing = client.register.getSingleMetric(name);
  if (existing) return existing;
  return new client.Counter({ name, help:'AI follow-up suggestions requested', registers:[client.register] });
}

export default async function handler(_req, res){
  try { getOrCreateCounter().inc(); } catch {}
  res.status(200).json({ suggestions: [
    "Send oppsummeringsmail til kontakt.",
    "Foreslå nytt møte neste uke.",
    "Logg ticket som blocker deal."
  ]});
}
