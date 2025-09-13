const addons = [
  { id: "crm",   name: "Kontakter",   icon: "👥", category: "CRM", enabled: true,  description: "Kunder og kontakter" },
  { id: "mail",  name: "E-post",      icon: "✉️", category: "Kommunikasjon", enabled: true, description: "Send og motta e-post" },
  { id: "erp",   name: "Faktura",     icon: "📄", category: "ERP", enabled: false, description: "Fakturering og regnskap", connectUrl: "/connect/erp" },
  { id: "files", name: "Dokumenter",  icon: "📁", category: "Innhold", enabled: true, description: "Filer og deling" },
];

let contacts = [
  { id:"1", name:"Ola Nordmann", email:"ola@example.com", phone:"+47 99887766", crmId:"HS-1001", system:"hubspot" },
  { id:"2", name:"Kari Normann", email:"kari@example.com", phone:"+47 90112233", crmId:"HS-1002", system:"hubspot" },
];

const delay = (ms:number) => new Promise(res => setTimeout(res, ms));
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString();
  const method = (init?.method || "GET").toUpperCase();

  if (url.endsWith("/api/health")) {
    await delay(120); return new Response(JSON.stringify({ ok: true, service: "core" }), { status: 200 });
  }

  if (url.endsWith("/api/addons") && method==="GET") {
    await delay(120); return new Response(JSON.stringify(addons), { status: 200, headers: { "Content-Type":"application/json" } });
  }

  if (url.endsWith("/api/crm/contacts") && method==="GET") {
    await delay(140); return new Response(JSON.stringify(contacts), { status: 200, headers: { "Content-Type":"application/json" } });
  }
  if (url.endsWith("/api/crm/contacts") && method==="POST") {
    await delay(160);
    try {
      const bodyText = typeof (init as any).body === "string" ? (init as any).body : "";
      const payload = bodyText ? JSON.parse(bodyText) : {};
      const id = String(Date.now());
      const crmId = "HS-" + id.slice(-4);
      const item = { id, system:"hubspot", crmId, ...payload };
      contacts = [item, ...contacts];
      return new Response(JSON.stringify(item), { status: 201, headers: { "Content-Type":"application/json" } });
    } catch {
      return new Response(JSON.stringify({ error:"Bad JSON" }), { status: 400 });
    }
  }

  if (url.endsWith("/core/actions/commit") && method==="POST") {
    await delay(180);
    try {
      const bodyText = typeof (init as any).body === "string" ? (init as any).body : "";
      const { proposal } = bodyText ? JSON.parse(bodyText) : { proposal: null };
      const link = proposal?.entity==="contact" ? `https://app.hubspot.com/contacts/${proposal?.entityId||"new"}` : "https://app.example.com";
      return new Response(JSON.stringify({ ok:true, externalId: proposal?.entityId || "new", version:"v1", link }), { status: 200, headers: { "Content-Type":"application/json" } });
    } catch {
      return new Response(JSON.stringify({ ok:false, errors:["parse-error"] }), { status: 500 });
    }
  }

  return originalFetch(input, init);
};