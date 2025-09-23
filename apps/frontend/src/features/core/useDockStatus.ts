import { useMemo } from "react";
import type { PeripheralStatus } from "@/features/dock/PeripheralCue";
import { useBuoyStatus } from "@/features/buoy/useBuoyStatus";
import { useApiStatus } from "./useApiStatus";

export function resolveDockStatus(isTyping: boolean, statusCode: number | null): PeripheralStatus {
  if (isTyping) {
    return "thinking";
  }
  if (statusCode == null) {
    return "ok";
  }
  if (statusCode === 0 || statusCode >= 500) {
    return "error";
  }
  if (statusCode >= 400) {
    return "warn";
  }
  return "ok";
}

export function useDockStatus(): PeripheralStatus {
  const { isTyping } = useBuoyStatus();
  const { status } = useApiStatus();
  return useMemo(() => resolveDockStatus(isTyping, status), [isTyping, status]);
}

export default useDockStatus;
