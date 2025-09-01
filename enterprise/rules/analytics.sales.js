import { readSalesFacts } from '../connectors/analytics.js';

function topAccounts(rows){
  const sorted = [...rows].sort((a,b)=>(b.target||0)-(a.target||0));
  const cut = Math.max(1, Math.floor(sorted.length*0.3));
  return new Set(sorted.slice(0,cut).map(r=>r.customer_id));
}

export async function generateAnalyticsSignals({date}){
  const rows = await readSalesFacts({date});
  if(!rows.length) return [];
  const perCustomer = new Map();
  rows.forEach(r=>{
    const k = r.customer_id;
    const o = perCustomer.get(k) || { ytd:0, ly_ytd:0, qtd:0, lq_qtd:0, mtd:0, lm_mtd:0, target:0, products:[] };
    o.ytd += r.ytd||0; o.ly_ytd += r.ly_ytd||0; o.qtd += r.qtd||0; o.lq_qtd += r.lq_qtd||0;
    o.mtd += r.mtd||0; o.lm_mtd += r.lm_mtd||0; o.target += r.target||0;
    o.products.push(r);
    perCustomer.set(k,o);
  });
  const top = topAccounts(rows);
  const out = [];
  for(const [customer_id, agg] of perCustomer){
    const yoy = pctChange(agg.ytd, agg.ly_ytd);
    const qgap = (agg.target||0) - (agg.qtd||0);
    const mMix = productMixShift(agg.products);
    if(yoy < -15 && (top.has(customer_id) || qgap > 0)){
      out.push({
        type:'analytics:revenue_drop',
        title:`${customer_id}: -${Math.abs(Math.round(yoy))}% YoY`,
        payload:{ customer_id, yoy_pct:yoy, kpi_gap:qgap, time_hint:null }
      });
    }
    if(qgap > 0){
      out.push({
        type:'analytics:target_gap',
        title:`${customer_id}: Mangler ${Math.round(qgap)} mot mål (Q)`,
        payload:{ customer_id, target_gap:qgap, time_hint:'quarter_end' }
      });
    }
    if(mMix.changed){
      out.push({
        type:'analytics:product_mix_shift',
        title:`${customer_id}: Endring i produktmiks (${mMix.product})`,
        payload:{ customer_id, product:mMix.product, delta_pct:mMix.delta_pct, time_hint:null }
      });
    }
  }
  return out;
}

function pctChange(curr, prev){
  if((prev||0)===0) return 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function productMixShift(products){
  const totalM = products.reduce((s,r)=>s+(r.mtd||0),0);
  const totalLM = products.reduce((s,r)=>s+(r.lm_mtd||0),0) || 1;
  let changed=false, product=null, delta_pct=0;
  products.forEach(r=>{
    const shareM = totalM? (r.mtd||0)/totalM : 0;
    const shareLM = totalLM? (r.lm_mtd||0)/totalLM : 0;
    const d = (shareM - shareLM)*100;
    if(Math.abs(d) > 20 && Math.abs(d)>Math.abs(delta_pct)){ changed=true; product=r.product_id; delta_pct=d; }
  });
  return { changed, product, delta_pct };
}
