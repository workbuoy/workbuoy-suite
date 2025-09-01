
import React from 'react';
import PortalLayout from '../../components/PortalLayout';
export default function Billing(){
  const [loading,setLoading]=React.useState(false);
  const start=async(plan)=>{
    setLoading(true);
    const priceMap={'Solo Pro':process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO,'Team':process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,'Business':process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS};
    const priceId=priceMap[plan]||process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO;
    const r=await fetch('/api/billing/create-checkout-session',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({priceId})});
    const j=await r.json(); location.href=j.url;
  };
  return <PortalLayout>
    <h1>Abonnement</h1>
    <p>Velg plan eller endre senere.</p>
    <div style={{display:'flex',gap:12}}>
      <button disabled={loading} onClick={()=>start('Solo Pro')}>Solo Pro</button>
      <button disabled={loading} onClick={()=>start('Team')}>Team</button>
      <button disabled={loading} onClick={()=>start('Business')}>Business</button>
    </div>
  </PortalLayout>;
}
