
import { useEffect, useState } from 'react';
import PortalLayout from '../../../components/PortalLayout';

export default function AdminUsers(){
  const [rows,setRows] = useState<any[]>([]);
  const [email,setEmail] = useState('');
  const [role,setRole] = useState('user');
  useEffect(()=>{ (async()=>{
    const r = await fetch('/api/admin/users',{ headers:{ 'x-tenant-id':'demo-tenant','x-user-id':'admin@example.com' }});
    const j = await r.json(); setRows(j.users||[]);
  })(); }, []);
  async function updateRole(){
    await fetch('/api/admin/users', { method:'POST', headers:{ 'Content-Type':'application/json','x-tenant-id':'demo-tenant','x-user-id':'admin@example.com' }, body: JSON.stringify({ target_user: email, role }) });
    location.reload();
  }
  return (
    <PortalLayout>
      <h1 className="text-2xl font-bold mb-4">Brukere & Roller</h1>
      <div className="p-4 bg-white rounded-2xl shadow mb-6">
        <h2 className="font-semibold mb-2">Sett rolle / Inviter</h2>
        <input className="border p-2 mr-2 rounded" placeholder="bruker@domene.no" value={email} onChange={e=>setEmail(e.target.value)} />
        <select className="border p-2 mr-2 rounded" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="admin">admin</option>
          <option value="user">user</option>
          <option value="readonly">readonly</option>
        </select>
        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white" onClick={updateRole}>Lagre</button>
      </div>
      <table className="min-w-full bg-white rounded-2xl shadow">
        <thead><tr><th className="p-2 text-left">User</th><th className="p-2 text-left">Role</th></tr></thead>
        <tbody>
          {rows.map((r:any)=>(<tr className="border-t" key={r.user_id}><td className="p-2">{r.user_id}</td><td className="p-2">{r.role}</td></tr>))}
        </tbody>
      </table>
    </PortalLayout>
  );
}
