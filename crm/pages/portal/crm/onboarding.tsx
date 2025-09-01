import React from 'react';

export default function Onboarding(){
  const [ok, setOk] = React.useState(false);
  async function tryDemo(){
    const res = await fetch('/api/onboarding/demo', { method: 'POST' });
    setOk(res.ok);
  }
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">Velkommen til Buoy CRM</h1>
      <p className="opacity-80 mb-4">Sett opp din organisasjon, importer brukere via SSO/SCIM – eller prøv demo-data for å komme i gang.</p>
      <div className="flex gap-2">
        <a className="border rounded px-3 py-2" href="/api/auth/oidc/initiate">Logg inn med OIDC</a>
        <form action="/api/auth/saml/acs" method="post"><button className="border rounded px-3 py-2" type="submit">SAML Login</button></form>
        <button className="border rounded px-3 py-2" onClick={tryDemo}>Prøv demo</button>
      </div>
      {ok && <div className="mt-3 text-green-700">Demo-data lagt inn ✅</div>}
    </div>
  );
}
