import { useEffect, useMemo, useRef, useState } from "react";

export type Heat = "cold"|"warm"|"hot";

type PrefetchItem = { key: string; url: string; method?: "GET"|"POST"; body?: any };

export function usePredictivePrefetch(opts?: { intents?: string[] }){
  const [status, setStatus] = useState<"idle"|"prefetching"|"ready">("idle");
  const [heat, setHeat] = useState<Heat>("cold");
  const controller = useRef<AbortController|null>(null);

  const schedule = useMemo(()=> {
    const day = new Date().getDay(); // 1=Mon ... 0=Sun
    const intents = (opts?.intents||[]).slice(-5);
    const items: PrefetchItem[] = [];
    if (day === 1) { items.push({ key:"reports.monday", url:"/api/reports/weekly" }); items.push({ key:"crm.contacts", url:"/api/crm/contacts" }); }
    if (intents.some(i => i.startsWith("contacts.") || i.startsWith("invoices.") || i.includes("crm"))) items.push({ key:"crm.contacts", url:"/api/crm/contacts" });
    if (intents.some(i => i.startsWith("tasks.") || i.includes("report"))) items.push({ key:"reports.recent", url:"/api/reports/recent" });
    items.push({ key:"addons", url:"/api/addons" });
    const seen = new Set<string>(); const dedup: PrefetchItem[] = []; for (const it of items){ if(!seen.has(it.key)){ seen.add(it.key); dedup.push(it); } }
    return dedup;
  }, [opts?.intents]);

  useEffect(()=>{
    if (!schedule.length) { setStatus("idle"); setHeat("cold"); return; }
    setStatus("prefetching"); setHeat("warm");
    controller.current?.abort(); controller.current = new AbortController();
    const p = schedule.map(async it => {
      try {
        await fetch(it.url, { method: it.method||"GET", signal: controller.current!.signal,
          headers: it.body ? { "Content-Type":"application/json" } : undefined,
          body: it.body ? JSON.stringify(it.body) : undefined });
      } catch {}
    });
    Promise.allSettled(p).then(()=>{ setStatus("ready"); setHeat("hot"); });
    return ()=> controller.current?.abort();
  }, [schedule]);

  const message = useMemo(()=>{
    const day = new Date().getDay();
    if (day === 1) return "Laster mandagsrapporter…";
    if (day === 5) return "Forbereder ukesoppsummering…";
    return "Forbereder det du vanligvis trenger…";
  }, []);

  return { status, heat, schedule, message };
}