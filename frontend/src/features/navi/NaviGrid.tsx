import React, { useMemo, useState } from "react";
import AddOnTile from "./AddOnTile";
import SynchBadge from "./SynchBadge";
import ContactsPanel from "../CRMPanel";
import { useAddonsStore } from "../addons/AddonsStore";
import { naviStrings as strings } from "./strings";
import { Flags } from "@/lib/flags";
import O365Panel from "@/features/integrations/o365/O365Panel";
import Preferences from "@/features/settings/Preferences";

export default function NaviGrid() {
  const { addons, loading, error, toggle } = useAddonsStore();
  const [filter, setFilter] = useState(strings.filterAll);
  const [open, setOpen] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    addons.forEach((addon) => unique.add(addon.category));
    return [strings.filterAll, ...Array.from(unique)];
  }, [addons]);

  const visibleAddons = useMemo(() => {
    if (filter === strings.filterAll) return addons;
    return addons.filter((addon) => addon.category === filter);
  }, [addons, filter]);

  function handleOpen(addonId: string, name: string) {
    if (addonId === "crm") {
      setOpen("crm");
      return;
    }
    if (addonId === "o365" && Flags.enableO365Panel) {
      setOpen("o365");
      return;
    }
    window.alert?.(strings.openAddon(name));
  }

  return (
    <div role="region" aria-label={strings.regionLabel} style={{display:"grid",gridTemplateRows:"auto auto 1fr",height:"100%"}}>
      <div style={{display:"flex", gap:10, padding:12, alignItems:"center"}}>
        <span className="chip">Navi</span>
        <select aria-label={strings.filterLabel} value={filter} onChange={e=>setFilter(e.target.value)}
                style={{background:"transparent", color:"var(--ink)", border:"1px solid rgba(255,255,255,.14)", borderRadius:8,
padding:"6px 8px"}}>
          {categories.map(c=> <option key={c} value={c} style={{color:"#000"}}>{c}</option>)}
        </select>
        <span style={{flex:1}}/>
        <SynchBadge status={loading ? "wait" : "ok"}/>
      </div>
      <div style={{padding:"0 12px"}}>
        <Preferences />
      </div>
      <div style={{position:"relative", padding:12, height:"100%"}}>
        {error && (
          <div role="alert" className="mb-4 rounded-md border border-red-500/60 bg-red-900/30 p-3 text-sm text-red-200">
            {strings.manifestError}
          </div>
        )}
        {!open ? (
          <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", overflow:"auto", height:"100%"}}>
            {visibleAddons.length === 0 && !loading ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 text-center text-sm text-slate-300">
                {strings.emptyState}
              </div>
            ) : (
              visibleAddons.map((addon) => (
                <AddOnTile
                  key={addon.id}
                  id={addon.id}
                  name={addon.name}
                  icon={addon.icon || "🧩"}
                  enabled={addon.enabled}
                  onOpen={() => handleOpen(addon.id, addon.name)}
                  onToggle={(next) => toggle(addon.id, next)}
                  connectedLabel={strings.connectedLabel}
                  disconnectedLabel={strings.disconnectedLabel}
                  toggleOn={strings.toggleOn}
                  toggleOff={strings.toggleOff}
                />
              ))
            )}
          </div>
        ) : (
          <div style={{position:"absolute", inset:12, overflow:"auto", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:12}}>
            {open==="crm" && <ContactsPanel onClose={()=>setOpen(null)}/>}
            {open==="o365" && Flags.enableO365Panel && <O365Panel onClose={()=>setOpen(null)} />}
          </div>
        )}
      </div>
    </div>
  );
}
