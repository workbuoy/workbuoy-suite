import { useState } from "react";
export type PeripheralState = "ok"|"pending"|"alert";
export function usePeripheralStatus(){
  const [state, setState] = useState<PeripheralState>("ok");
  return { state, setState };
}