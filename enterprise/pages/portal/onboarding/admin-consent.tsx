import Link from 'next/link';
import PortalLayout from '../../../components/PortalLayout';

export default function AdminConsent(){
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold mb-2">IT-godkjenning</h1>
      <p className="text-gray-700 mb-4">Noen tilkoblinger krever at IT gir samtykke på vegne av organisasjonen (for eksempel Microsoft Graph, Google Workspace og enkelte ERP/HR-systemer).</p>
      <ol className="list-decimal ml-6 space-y-2">
        <li>Trykk på <b>Gi godkjenning</b>-knappen for riktig leverandør.</li>
        <li>Logg inn med riktig admin-konto. Les hva WorkBuoy ber om og bekreft.</li>
        <li>Du kan trekke tilbake tilgangen senere via leverandørens admin-konsoll.</li>
      </ol>
      <div className="mt-6 p-4 rounded-2xl bg-gray-50 border">
        <h2 className="font-semibold">Hva vi ber om</h2>
        <ul className="list-disc ml-5 text-sm text-gray-700">
          <li>Kun minste nødvendige lese-tilganger for å hente e-post, kalender, filer eller kundedata.</li>
          <li>Ingen endringer blir gjort i kildesystemer uten eksplisitt bekreftelse.</li>
          <li>All tilgang kan logges og revideres i WorkBuoy (audit-logg).</li>
        </ul>
      </div>
      <div className="mt-6">
        <Link href="/portal/info"><a className="underline">Les mer om sikkerhet og ansvar</a></Link>
      </div>
    </PortalLayout>
  );
}
