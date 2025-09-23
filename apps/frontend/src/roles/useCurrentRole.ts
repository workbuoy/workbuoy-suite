import { useEffect, useState } from "react";

type RoleEventDetail = {
  roleId: string;
  displayName?: string;
  persona?: string;
};

function readRole(): RoleEventDetail {
  if (typeof window === "undefined") {
    return { roleId: "ops", displayName: "Operations" };
  }
  const ctx = (window as any).__WB_CONTEXT__ || (window as any).APP_STATE || {};
  const roleId = (ctx.roleId || ctx.role || ctx.primaryRole || "ops").toString();
  const displayName = ctx.roleDisplayName || ctx.roleName || roleId;
  const persona = ctx.persona || ctx.personaId || ctx.segment;
  return { roleId, displayName, persona };
}

export function useCurrentRole() {
  const [state, setState] = useState<RoleEventDetail>(() => readRole());

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<RoleEventDetail>;
      if (custom.detail?.roleId) {
        setState({
          roleId: custom.detail.roleId,
          displayName: custom.detail.displayName || custom.detail.roleId,
          persona: custom.detail.persona,
        });
      }
    };
    window.addEventListener("wb:role-changed", handler as EventListener);
    return () => window.removeEventListener("wb:role-changed", handler as EventListener);
  }, []);

  return state;
}

export type { RoleEventDetail as RoleInfo };
