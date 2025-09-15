# Undo Token (PR-30)

- `/core/undo { token }` aksepterer et tokensom ble utstedt ved vellykket write.
- `registerUndo(token, action)` kan kalles fra write-ruter for å gjøre ekte rollback senere.
- Denne PR-en leverer bare endpoint + in-memory token store.