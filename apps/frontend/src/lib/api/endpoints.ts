import { useApi } from "./client";

export type Contact = { id:string; name:string; email?:string; phone?:string; createdAt?:string };

export function useEndpoints(){
  const { withContext } = useApi();

  async function listAddons(){
    return withContext("/api/addons", { method:"GET" }, { intent:"addons.list" }).then(r=>r.json());
  }

  async function listContacts(){
    const res = await withContext("/api/crm/contacts", { method:"GET" }, { intent:"contacts.list" });
    return res.json();
  }

  async function createContact(input: Partial<Contact> & { whenISO?: string }){
    const res = await withContext("/api/crm/contacts", {
      method:"POST",
      body: JSON.stringify(input)
    }, { intent:"contacts.create", whenISO: input.whenISO });
    return res;
  }

  async function deleteContact(id: string){
    const res = await withContext(`/api/crm/contacts/${id}`, { method:"DELETE" }, { intent:"contacts.delete" });
    return res;
  }

  async function buoyComplete(payload: { text:string; intent?: any; whenISO?: string }){
    const res = await withContext("/core/complete", {
      method:"POST",
      body: JSON.stringify(payload)
    }, { intent: payload.intent?.kind, whenISO: payload.whenISO });
    return res;
  }

  async function undoPerform(token: string){
    const res = await withContext("/core/undo", {
      method:"POST",
      body: JSON.stringify({ token })
    }, { intent:"undo.perform" });
    return res;
  }

  return { listAddons, listContacts, createContact, deleteContact, buoyComplete, undoPerform };
}