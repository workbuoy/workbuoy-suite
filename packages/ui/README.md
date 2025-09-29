# @workbuoy/ui

Shared UI components for Workbuoy applications.

## ProactivitySwitch

### Controlled toggle

```tsx
import { useState } from "react";
import { ProactivitySwitch } from "@workbuoy/ui";

export function ControlledSwitch() {
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

### Uncontrolled toggle

```tsx
import { ProactivitySwitch } from "@workbuoy/ui";

export function DefaultSwitch() {
  return <ProactivitySwitch defaultValue="proactive" aria-label="Mode" />;
}
```

## FlipCard

### Uncontrolled flip

```tsx
import { FlipCard } from "@workbuoy/ui";

export function InlineFlip() {
  return (
    <FlipCard front={<span>Hover me</span>} back={<span>Surprise!</span>} />
  );
}
```

### Controlled flip

```tsx
import { useState } from "react";
import { FlipCard } from "@workbuoy/ui";

export function ControlledFlip() {
  const [flipped, setFlipped] = useState(false);
  return (
    <FlipCard
      isFlipped={flipped}
      onFlip={() => setFlipped((value) => !value)}
      front={<span>Team KPIs</span>}
      back={<span>Up 18% 🚀</span>}
    />
  );
}
```
