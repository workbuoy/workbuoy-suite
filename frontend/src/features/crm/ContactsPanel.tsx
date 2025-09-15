// frontend/src/features/crm/ContactsPanel.tsx
import React,{useEffect,useState} from 'react';
export default function ContactsPanel(){
  const [contacts,setContacts] = useState<any[]>([]);
  useEffect(()=>{
    fetch('/api/crm/contacts').then(r=>r.json()).then(setContacts).catch(()=>{});
  },[]);
  return <div><h2>Contacts</h2><pre>{JSON.stringify(contacts,null,2)}</pre></div>;
}
