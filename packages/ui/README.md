# @workbuoy/ui

Shared UI components for Workbuoy applications.

## Usage

```tsx
import { useState } from "react";
import { ProactivitySwitch } from "@workbuoy/ui";

export function Example() {
  const [mode, setMode] = useState<"proactive" | "reactive">("reactive");
  return (
    <ProactivitySwitch
      value={mode}
      onChange={setMode}
      labels={{ proactive: "Proaktiv", reactive: "Reaktiv" }}
    />
  );
}
```
