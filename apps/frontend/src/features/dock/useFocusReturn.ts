import React from "react";

export function useFocusReturn(open: boolean) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      ref.current = (document.activeElement as HTMLElement) ?? null;
    }
  }, [open]);

  return ref;
}
