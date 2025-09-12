const addons = [
  { id: "crm",   name: "Kontakter",   icon: "👥", category: "CRM", enabled: true },
  { id: "mail",  name: "E-post",      icon: "✉️", category: "Kommunikasjon", enabled: true },
  { id: "erp",   name: "Faktura",     icon: "📄", category: "ERP", enabled: false },
  { id: "files", name: "Dokumenter",  icon: "📁", category: "Innhold", enabled: true },
];
const delay = (ms:number) => new Promise(res => setTimeout(res, ms));
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString();
  if (url.endsWith("/api/health")) {
    await delay(200); return new Response(JSON.stringify({ ok: true, service: "core" }), { status: 200 });
  }
  if (url.endsWith("/api/addons")) {
    await delay(250); return new Response(JSON.stringify(addons), { status: 200 });
  }
  return originalFetch(input, init);
};