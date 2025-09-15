// frontend/src/features/crm/ContactsPanel.tsx
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";

type Contact = { id:string; name:string; email?:string; phone?:string };

export default function ContactsPanel(){
  const [contacts,setContacts] = useState<Contact[]>([]);
  useEffect(()=>{
    fetch('/api/crm/contacts').then(r=>r.json()).then(setContacts).catch(()=>{});
  },[]);
  return (
    <Card className="p-4">
      <h2 className="text-xl mb-2">Contacts</h2>
      <table className="w-full text-sm">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
        <tbody>
          {contacts.map(c=>(
            <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td></tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
