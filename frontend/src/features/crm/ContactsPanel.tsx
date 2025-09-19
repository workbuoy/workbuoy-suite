import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/api";

type FormState = { id:string; name:string; email:string; phone:string };

export function ContactsPanel({ onClose }: { onClose?: () => void } = {}) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ id:"", name:"", email:"", phone:"" });

  async function load() {
    const res = await apiFetch<any[]>('/api/crm/contacts');
    setContacts(res);
  }
  useEffect(()=>{ load(); }, []);

  async function save() {
    await apiFetch('/api/crm/contacts', { method:'POST', body: JSON.stringify(form) });
    setOpen(false);
    setForm({ id:"", name:"", email:"", phone:"" });
    load();
  }

  return (
    <Card className="m-2">
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Contacts</h2>
          <Dialog open={open} onOpenChange={(value)=>{ setOpen(value); if (!value && onClose) onClose(); }}>
            <DialogTrigger asChild>
              <Button>Add Contact</Button>
            </DialogTrigger>
            <DialogContent>
              <Input placeholder="id" value={form.id} onChange={e=>setForm({...form,id:e.target.value})}/>
              <Input placeholder="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              <Input placeholder="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
              <Input placeholder="phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
              <Button onClick={save}>Save</Button>
            </DialogContent>
          </Dialog>
        </div>
        <table className="w-full">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
          <tbody>
            {contacts.map(c=>(<tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td></tr>))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default ContactsPanel;
