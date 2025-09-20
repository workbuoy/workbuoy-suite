import React, { useMemo, useState } from "react";
import AddOnTile from "./AddOnTile";
import SynchBadge from "./SynchBadge";
import ContactsPanel from "../CRMPanel";
import { useAddonsStore } from "../addons/AddonsStore";
import { naviStrings as strings } from "./strings";
import O365Panel from "@/features/integrations/o365/O365Panel";
import CollabPanel from "@/features/integrations/chat/CollabPanel";
import GWorkspacePanel from "@/features/integrations/gws/GWorkspacePanel";
import VismaImpactPanel from "@/features/integrations/visma/VismaImpactPanel";
import Preferences from "@/features/settings/Preferences";
import { useSettings } from "@/store/settings";

type IntegrationTileDescriptor = {
  id: "collab" | "gws" | "visma";
  name: string;
  description: string;
  icon: string;
};

export default function NaviGrid() {
  const { addons, loading, error, toggle } = useAddonsStore();
  const [filter, setFilter] = useState(strings.filterAll);
  const [open, setOpen] = useState<string | null>(null);
  const { enableO365Panel, enableCollabPanel, enableGwsPanel, enableVismaPanel } = useSettings((state) => ({
    enableO365Panel: state.enableO365Panel,
    enableCollabPanel: state.enableCollabPanel,
    enableGwsPanel: state.enableGwsPanel,
    enableVismaPanel: state.enableVismaPanel,
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

  const integrationTiles = useMemo<IntegrationTileDescriptor[]>(() => {
    const tiles: IntegrationTileDescriptor[] = [];
    if (enableCollabPanel) {
      tiles.push({
        id: "collab",
        name: "Teams & Slack",
        description: "Se siste tråder og risiko-signal før neste demo.",
        icon: "💬",
      });
    }
    if (enableGwsPanel) {
      tiles.push({
        id: "gws",
        name: "Google Workspace",
        description: "Følg opp utkast og delte dokumenter i demoen.",
        icon: "📄",
      });
    }
    if (enableVismaPanel) {
      tiles.push({
        id: "visma",
        name: "Visma innsikt",
        description: "KPI-oversikt for kost, tid og purringer.",
        icon: "📊",
      });
    }
    return tiles;
  }, [enableCollabPanel, enableGwsPanel, enableVismaPanel]);

  React.useEffect(() => {
    if (open === "o365" && !enableO365Panel) setOpen(null);
    if (open === "collab" && !enableCollabPanel) setOpen(null);
    if (open === "gws" && !enableGwsPanel) setOpen(null);
    if (open === "visma" && !enableVismaPanel) setOpen(null);
  }, [open, enableO365Panel, enableCollabPanel, enableGwsPanel, enableVismaPanel]);

  function handleOpen(addonId: string, name: string) {
    if (addonId === "crm") {
      setOpen("crm");
      return;
    }
    if (addonId === "o365" && enableO365Panel) {
      setOpen("o365");
      return;
    }
    if (addonId === "collab" && enableCollabPanel) {
      setOpen("collab");
      return;
    }
    if (addonId === "gws" && enableGwsPanel) {
      setOpen("gws");
      return;
    }
    if (addonId === "visma" && enableVismaPanel) {
      setOpen("visma");
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
            {(!loading && visibleAddons.length === 0 && (filter !== strings.filterAll || integrationTiles.length === 0)) ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 text-center text-sm text-slate-300">
                {strings.emptyState}
              </div>
            ) : (
              <>
                {visibleAddons.map((addon) => (
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
                ))}
                {filter === strings.filterAll &&
                  integrationTiles.map((tile) => (
                    <IntegrationCard
                      key={tile.id}
                      id={tile.id}
                      icon={tile.icon}
                      name={tile.name}
                      description={tile.description}
                      onOpen={() => setOpen(tile.id)}
                    />
                  ))}
              </>
            )}
          </div>
        ) : (
          <div style={{position:"absolute", inset:"var(--space-md)", overflow:"auto", border:"1px solid var(--stroke-hairline)", borderRadius:"var(--radius-lg)", padding:"var(--space-md)"}}>
            {open==="crm" && <ContactsPanel onClose={()=>setOpen(null)}/>}
            {open==="o365" && enableO365Panel && <O365Panel onClose={()=>setOpen(null)} />}
            {open==="collab" && enableCollabPanel && <CollabPanel onClose={()=>setOpen(null)} />}
            {open==="gws" && enableGwsPanel && <GWorkspacePanel onClose={()=>setOpen(null)} />}
            {open==="visma" && enableVismaPanel && <VismaImpactPanel onClose={()=>setOpen(null)} />}
          </div>
        )}
      </div>
    </div>
  );
}

type IntegrationCardProps = IntegrationTileDescriptor & {
  onOpen: () => void;
};

function IntegrationCard({ icon, name, description, onOpen, id }: IntegrationCardProps) {
  return (
    <article
      className="flex h-full flex-col justify-between rounded-xl border border-indigo-500/40 bg-indigo-900/20 p-4 text-left text-indigo-100 transition hover:border-indigo-400/70 focus-within:border-indigo-300/80"
      data-integration-card={id}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label={name}
      >
        <span aria-hidden="true" className="text-2xl">
          {icon}
        </span>
        <div>
          <div className="font-semibold">{name}</div>
          <p className="mt-2 text-sm text-indigo-100/80">{description}</p>
        </div>
      </button>
      <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/60 px-3 py-1 text-xs text-indigo-100">
        Demo
      </span>
    </article>
  );
}
