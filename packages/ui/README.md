# @workbuoy/ui

Shared UI components for Workbuoy applications.

## Storybook

- Local dev server: `npm run -w @workbuoy/ui storybook`
- Production build check: `npm run -w @workbuoy/ui storybook:check`
- Pull request preview: every PR touching `packages/ui/**` runs the **ui-storybook** workflow in GitHub Actions and uploads a `storybook-preview` artifact containing the static build.
- Production deploy: merges to `main` trigger the **deploy-ui-storybook** workflow, which publishes the latest static build to GitHub Pages.

## Accessibility

- All interactive components ship with a shared `.wbui-focus-ring` style (imported via `@workbuoy/ui/index.css`) so keyboard users get a consistent, high-contrast outline via `:focus-visible`.
- `FlipCard` behaves like a toggle button (`role="button"`, `aria-pressed`) and reacts to <kbd>Enter</kbd> and <kbd>Space</kbd>. If users request reduced motion, the flip completes instantly.
- `ProactivitySwitch` maps to `role="switch"` with `aria-checked` and an optional `aria-label`/`aria-labelledby`. Pressing <kbd>Enter</kbd> or <kbd>Space</kbd> toggles the mode, and a polite `aria-live` announcement confirms the current state for assistive tech users.

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
