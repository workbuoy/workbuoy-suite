# Peripheral Vision UI (PR-19)
Subtile kantfarger i periferien signaliserer systemstatus uten å stjele fokus.
- Grønn = OK, Gul = Venter (breathe), Rød = Krever handling.

Komponenter:
- `usePeripheralStatus()`
- `StatusEdge` (inset box-shadow)

FlipCard monterer `StatusEdge` med demo-knapper.