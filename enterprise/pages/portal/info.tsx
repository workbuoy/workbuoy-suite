export default function Info(){
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Viktig informasjon</h1>
      <p className="text-gray-800 mb-3">WorkBuoy kan gjøre feil. Sjekk viktig informasjon i kildesystemene før du handler.</p>
      <ul className="list-disc ml-5 text-gray-800 space-y-1">
        <li>Bekreft viktige opplysninger i originalsystemet (e-post, CRM, ERP) før du tar beslutninger.</li>
        <li>Du er selv ansvarlig for endringer som gjøres. WorkBuoy ber om bekreftelse før handling.</li>
        <li>Verifiser forslag ved å åpne kilden via lenkene WorkBuoy viser.</li>
        <li>Gi oss beskjed om feil via “Tilbakemelding” i portalen, eller Meld sak til IT.</li>
      </ul>
    </div>
  );
}
