# Archive Overview

To keep the root of the repository focused on the workspaces that are still actively maintained, legacy directories have been relocated under `docs/archive/`.

The following top-level folders were archived as part of this cleanup:

- `backend/`
- `desktop_demo/`
- `frontend/`
- `PR2_remove-legacy-routes-policy/`

These folders captured early experiments, proofs of concept, or superseded implementations. Their history is preserved in Git, so you can still review prior revisions or restore files when needed.

## Finding Historical Context

- Browse `docs/archive/` for the latest snapshot of the archived trees.
- Use `git log -- <path>` or `git blame <file>` to inspect the evolution of specific files before they were archived.
- If a component needs to be revived, copy the relevant material out of `docs/archive/` (or check out the required commit) instead of developing against the archived directories in place.

Archiving makes it easier to discover the current workspaces that live at the repository root while still keeping the legacy material close at hand for reference.
