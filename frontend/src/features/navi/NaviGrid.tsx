import React, { useMemo, useState } from "react";
import AddOnTile from "./AddOnTile";
import SynchBadge from "./SynchBadge";
import ContactsPanel from "../CRMPanel";
import { useAddonsStore } from "../addons/AddonsStore";
import { naviStrings as strings } from "./strings";
import O365Panel from "@/features/integrations/o365/O365Panel";
import Preferences from "@/features/settings/Preferences";
import { useSettings } from "@/store/settings";

export default function NaviGrid() {
  const { addons, loading, error, toggle } = useAddonsStore();
  const [filter, setFilter] = useState(strings.filterAll);
  const [open, setOpen] = useState<string | null>(null);
  const { enableO365Panel } = useSettings((state) => ({
    enableO365Panel: state.enableO365Panel,
  }));

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
    if (addonId === "o365" && enableO365Panel) {
      setOpen("o365");
      return;
    }
    window.alert?.(strings.openAddon(name));
  }

  return (
    <div
      role="region"
      aria-label={strings.regionLabel}
      style={{ display: "grid", gridTemplateRows: "auto auto 1fr", height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          gap: "var(--space-md)",
          padding: "var(--space-md)",
          alignItems: "center",
        }}
      >
        <span className="chip">Navi</span>
        <select aria-label={strings.filterLabel} value={filter} onChange={e=>setFilter(e.target.value)}
                style={{background:"transparent", color:"var(--fg-default)", border:"1px solid var(--stroke-subtle)", borderRadius:"var(--radius-md)",
padding:"var(--space-xs) var(--space-sm)"}}>
          {categories.map(c=> <option key={c} value={c} style={{color:"#000"}}>{c}</option>)}
        </select>
        <span style={{flex:1}}/>
        <SynchBadge status={loading ? "pending" : "ok"} />
      </div>
      <div style={{padding:"0 var(--space-md)"}}>
        <Preferences />
      </div>
      <div style={{position:"relative", padding:"var(--space-md)", height:"100%"}}>
        {error && (
          <div role="alert" className="mb-4 rounded-md border border-red-500/60 bg-red-900/30 p-3 text-sm text-red-200">
            {strings.manifestError}
          </div>
        )}
        {!open ? (
          <div style={{display:"grid", gap:"var(--space-lg)", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", overflow:"auto", height:"100%"}}>
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
          <div style={{position:"absolute", inset:"var(--space-md)", overflow:"auto", border:"1px solid var(--stroke-hairline)", borderRadius:"var(--radius-lg)", padding:"var(--space-md)"}}>
            {open==="crm" && <ContactsPanel onClose={()=>setOpen(null)}/>}
            {open==="o365" && enableO365Panel && <O365Panel onClose={()=>setOpen(null)} />}
          </div>
        )}
      </div>
    </div>
  );
}
