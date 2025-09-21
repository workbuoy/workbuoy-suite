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

## Visual walkthrough

![FlipCard annotated layout showing Buoy and Navi faces](data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMzYwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYmciIHgxPSIwIiB4Mj0iMSIgeTE9IjAiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzBhMWY0NCIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTEzYTdhIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3QgZmlsbD0idXJsKCNiZykiIHdpZHRoPSI3MjAiIGhlaWdodD0iMzYwIiByeD0iMjQiIC8+CiAgPHRleHQgeD0iMzYwIiB5PSI0OCIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjI4IiBmaWxsPSIjZjdmYmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GbGlwQ2FyZCBGcm9udCAvIEJhY2sgUmVsYXRpb25zaGlwPC90ZXh0PgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgwLDkwKSI+CiAgICA8cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgcng9IjE2IiBmaWxsPSIjMTIyODRhIiBzdHJva2U9IiM1ZmQxZmYiIHN0cm9rZS13aWR0aD0iMyIgLz4KICAgIDx0ZXh0IHg9IjEyMCIgeT0iMzYiIGZvbnQtZmFtaWx5PSJJbnRlcixBcmlhbCIgZm9udC1zaXplPSIyMiIgZmlsbD0iIzVmZDFmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QnVveSBQYW5lbDwvdGV4dD4KICAgIDx0ZXh0IHg9IjEyMCIgeT0iNzgiIGZvbnQtZmFtaWx5PSJJbnRlcixBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2Q3ZWNmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TGl2ZSByZWNvcmQ8L3RleHQ+CiAgICA8dGV4dCB4PSIxMjAiIHk9IjEwNCIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZDdlY2ZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BSSBzdWdnZXN0aW9uczwvdGV4dD4KICAgIDx0ZXh0IHg9IjEyMCIgeT0iMTMwIiBmb250LWZhbWlseT0iSW50ZXIsQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNkN2VjZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbm5lY3QgYnV0dG9uPC90ZXh0PgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MDAsOTApIj4KICAgIDxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMTgwIiByeD0iMTYiIGZpbGw9IiMxMjI4NGEiIHN0cm9rZT0iI2ZmZDE2NiIgc3Ryb2tlLXdpZHRoPSIzIiAvPgogICAgPHRleHQgeD0iMTIwIiB5PSIzNiIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjIyIiBmaWxsPSIjZmZkMTY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OYXZpIFBhbmVsPC90ZXh0PgogICAgPHRleHQgeD0iMTIwIiB5PSI3OCIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZlNmEzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Db25uZWN0aW9uczwvdGV4dD4KICAgIDx0ZXh0IHg9IjEyMCIgeT0iMTA0IiBmb250LWZhbWlseT0iSW50ZXIsQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmU2YTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbnRleHQgY2FyZHM8L3RleHQ+CiAgICA8dGV4dCB4PSIxMjAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZlNmEzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcmlvcml0eSBoaW50czwvdGV4dD4KICA8L2c+CiAgPHBhdGggZD0iTTM0MCAxODBoNDAiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSI2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIC8+CiAgPHBvbHlnb24gcG9pbnRzPSIzODAsMTgwIDM2MCwxNjYgMzYwLDE5NCIgZmlsbD0iI2ZmZmZmZiIgLz4KICA8dGV4dCB4PSIzNjAiIHk9IjIxNCIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GbGlwIC8gUmVzaXplIC8gQ29ubmVjdDwvdGV4dD4KICA8cmVjdCB4PSIxNDAiIHk9IjMwMCIgd2lkdGg9IjQ0MCIgaGVpZ2h0PSIzNiIgcng9IjE4IiBmaWxsPSIjMWIzZDY2IiBzdHJva2U9IiM1ZmQxZmYiIHN0cm9rZS13aWR0aD0iMiIgLz4KICA8dGV4dCB4PSIzNjAiIHk9IjMyNCIgZm9udC1mYW1pbHk9IkludGVyLEFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjZDdlY2ZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BY3RpdmVDb250ZXh0IGtlZXBzIHRoZSB0d28gZmFjZXMgaW4gc3luYzwvdGV4dD4KPC9zdmc+)

The SVG mock highlights how the Buoy face, the Navi face, and the shared ActiveContext collaborate during flips.

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
