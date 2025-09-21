import { useEffect, useState } from "react";

export type ApiStatusDetail = {
  status: number | null;
  ok: boolean;
};

export const API_STATUS_EVENT = "wb:api-status";

let lastStatus: ApiStatusDetail = { status: null, ok: true };

export function emitApiStatus(detail: ApiStatusDetail) {
  lastStatus = { ...detail };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ApiStatusDetail>(API_STATUS_EVENT, { detail: lastStatus }));
  }
}

export function getLastApiStatus(): ApiStatusDetail {
  return lastStatus;
}

export function useApiStatus(): ApiStatusDetail {
  const [snapshot, setSnapshot] = useState<ApiStatusDetail>(lastStatus);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ApiStatusDetail>).detail;
      if (!detail) return;
      setSnapshot(detail);
    };
    window.addEventListener(API_STATUS_EVENT, handler as EventListener);
    return () => window.removeEventListener(API_STATUS_EVENT, handler as EventListener);
  }, []);

  return snapshot;
}
