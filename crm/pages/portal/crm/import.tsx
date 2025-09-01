import React from 'react';

export default function ImportCSV(){
  const [kind, setKind] = React.useState<'contacts'|'companies'>('contacts');
  const [csv, setCsv] = React.useState('name,email,company\nAda,ada@acme.io,Acme');
  const [result, setResult] = React.useState<any>(null);

  const submit = async () => {
    const res = await fetch('/api/import/csv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, csv }) });
    setResult(await res.json());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Import CSV</h1>
      <div className="mt-3">
        <label className="block text-sm mb-1">Kind</label>
        <select value={kind} onChange={e=>setKind(e.target.value as any)} className="border rounded px-2 py-1">
          <option value="contacts">contacts</option>
          <option value="companies">companies</option>
        </select>
      </div>
      <div className="mt-3">
        <label className="block text-sm mb-1">CSV</label>
        <textarea className="w-full border rounded p-2 h-40" value={csv} onChange={e=>setCsv(e.target.value)} />
      </div>
      <button onClick={submit} className="mt-3 rounded-xl border px-3 py-2 shadow-sm">Importer</button>
      {result && <pre className="mt-3 p-2 bg-gray-50 rounded border text-xs">{JSON.stringify(result,null,2)}</pre>}
    </div>
  );
}
