
const addons = [
  { id: "crm",   name: "Kontakter",   icon: "👥", category: "CRM", enabled: true,  description: "Kunder og kontakter" },
  { id: "mail",  name: "E-post",      icon: "✉️", category: "Kommunikasjon", enabled: true, description: "Send og motta e-post" },
  { id: "erp",   name: "Faktura",     icon: "📄", category: "ERP", enabled: false, description: "Fakturering og regnskap", connectUrl: "/connect/erp" },
  { id: "files", name: "Dokumenter",  icon: "📁", category: "Innhold", enabled: true, description: "Filer og deling" },
];
const delay = (ms:number) => new Promise(res => setTimeout(res, ms));
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString();
  if (url.endsWith("/api/health")) { await delay(150); return new Response(JSON.stringify({ ok: true, service: "core" }), { status: 200 }); }
  if (url.endsWith("/api/addons") && (!init || (init.method||"GET")==="GET")) { await delay(180); return new Response(JSON.stringify(addons), { status: 200, headers: { "Content-Type": "application/json" } }); }
  if (url.endsWith("/api/addons/intent") && init && (init.method||"POST")==="POST") {
    await delay(60);
    try { const bodyText = typeof (init as any).body === "string" ? (init as any).body : ""; const payload = bodyText ? JSON.parse(bodyText) : {}; console.log("[stub] intent logged", payload); } catch {}
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return originalFetch(input, init);
};
