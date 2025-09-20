# Navi FlipCard Guide

## Overview
The FlipCard is the primary shell that pairs the Buoy AI surface (front) with Navi context (back).
It now ships as a production-ready component that supports:

- **Flip** interactions via button, keyboard (`Enter`/`Space`), and touch/pointer gestures.
- **Resize** affordances with keyboard (`Shift+Arrow`) and pointer drag. Size presets cover `sm`→`xl` widths.
- **Connect** hooks to link the active Buoy record with Navi entities. The toolbar exposes a connect button that respects the current selection from `ActiveContext` and falls back to a manual dialog when nothing is selected.

## Component API
```tsx
import FlipCard from '@/components/FlipCard';

<FlipCard
  front={<BuoyPanel />}
  back={<NaviPanel />}
  size="lg"
  onFlip={(side) => console.log('now showing', side)}
  onResize={(size) => console.log('resized to', size)}
  onConnect={(link) => addConnection(link)}
/>
```

- `front` / `back`: React nodes rendered as the two faces. Each face should handle its own layout.
- `size`: optional initial preset (`'sm' | 'md' | 'lg' | 'xl'`).
- `onFlip`: callback invoked with `'front' | 'back'` whenever the card flips.
- `onResize`: receives the new size preset.
- `onConnect`: receives `{ type, id, label? }` when the connect affordance is used.
- `ariaLabelFront` / `ariaLabelBack`: optional overrides for assistive tech.

## Accessibility
- The flip button is a semantic `<button>` with `aria-pressed` state and descriptive labels (“Show Navi” / “Show Buoy”).
- Keyboard shortcuts: `Enter` or `Space` flips; `Shift+Arrow` resizes; the resize handle also responds to arrow keys.
- Focus stays within the active face. When the manual connect dialog opens it traps focus until dismissed, supports `Escape`, and labels all controls.
- The component respects `prefers-reduced-motion` by disabling flip transitions for those users.

## Styling & tokens
FlipCard consumes the shared tokens defined in `frontend/src/styles/tokens.css` (radius, color, motion). Custom CSS lives in `frontend/src/components/FlipCard/FlipCard.css`. The host element exposes classes:

- `.flip-card-host` / `.flip-host` – outer shell controlling width/height.
- `.flip-card--{size}` – current preset.
- `.flip-card--flipped` – applied when Navi is visible.

These classes allow downstream themes to override backgrounds or transitions without editing the component.

## Usage pattern
The production wiring lives in `frontend/src/App.tsx`:

1. Wrap the app with `ActiveContextProvider`.
2. Use `useConnections()` to store shared links between Buoy and Navi.
3. Render `FlipCard` with `<BuoyPanel>` and `<NaviPanel>`; forward `onConnect` to `addConnection`.
4. Render the `ModeSwitcher` and guard badges next to FlipCard to keep the autonomy context visible.

This pattern keeps the FlipCard reusable while centralising shared state in the shell.
