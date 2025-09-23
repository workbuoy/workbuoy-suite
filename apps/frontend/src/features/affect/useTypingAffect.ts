import { useEffect, useRef, useState } from "react";

export type Affect = "calm"|"focused"|"stressed";

export function useTypingAffect(target?: HTMLElement | null){
  const [affect, setAffect] = useState<Affect>("calm");
  const lastKey = useRef<number>(0);
  const backspaces = useRef<number>(0);
  const keys = useRef<number>(0);
  const timer = useRef<any>();

  useEffect(()=>{
    const el = target || document;
    function onKey(e: KeyboardEvent){
      const now = Date.now();
      if (e.key === "Backspace") backspaces.current++;
      keys.current++;
      const cadence = now - (lastKey.current || now);
      lastKey.current = now;
      const rate = keys.current / Math.max(1, ((timer.current?.start ?? now) - now) / -1000);
      // Simple heuristic: high backspaces + fast cadence => stressed
      if (backspaces.current >= 3 && cadence < 120) setAffect("stressed");
      else if (cadence < 200) setAffect("focused");
      else setAffect("calm");
    }
    function onFocus(){ backspaces.current = 0; keys.current = 0; timer.current = { start: Date.now() }; }
    const keyListener: EventListener = (event) => onKey(event as KeyboardEvent);
    const focusListener: EventListener = () => onFocus();
    el.addEventListener("keydown", keyListener);
    el.addEventListener("focus", focusListener, true);
    return ()=>{
      el.removeEventListener("keydown", keyListener);
      el.removeEventListener("focus", focusListener, true);
    };
  }, [target]);

  return { affect };
}