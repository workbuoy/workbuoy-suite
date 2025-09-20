import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/api";

export type AddonManifestEntry = {
  id: string;
  name: string;
  icon?: string;
  category: string;
  enabled: boolean;
  description?: string;
};

export type UseAddonsStoreResult = {
  addons: AddonManifestEntry[];
  loading: boolean;
  error: Error | null;
  toggle: (id: string, value?: boolean) => void;
};

export function useAddonsStore(): UseAddonsStoreResult {
  const [manifest, setManifest] = useState<AddonManifestEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [localEnabled, setLocalEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch<AddonManifestEntry[]>("/api/addons")
      .then((entries) => {
        if (!active) return;
        setManifest(entries);
        const map: Record<string, boolean> = {};
        entries.forEach((entry) => {
          map[entry.id] = entry.enabled !== false;
        });
        setLocalEnabled(map);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addons = useMemo(
    () =>
      manifest.map((entry) => ({
        ...entry,
        enabled: localEnabled[entry.id] ?? entry.enabled,
      })),
    [manifest, localEnabled]
  );

  function toggle(id: string, value?: boolean) {
    setLocalEnabled((prev) => {
      const current = prev[id] ?? true;
      const next = typeof value === "boolean" ? value : !current;
      return {
        ...prev,
        [id]: next,
      };
    });
  }

  return { addons, loading, error, toggle };
}

export function getEnabledAddons(addons: AddonManifestEntry[]): AddonManifestEntry[] {
  return addons.filter((addon) => addon.enabled);
}
