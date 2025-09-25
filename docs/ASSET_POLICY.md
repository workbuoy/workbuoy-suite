Asset Policy (Large Files)
==========================

Do not commit large binaries (images/videos/archives) to Git by default.

Prefer:

- External storage (object store, CDN) and reference by URL
- Git LFS (if truly necessary) with documented rationale

Max file size guideline: 5 MB (CI guard may flag larger files).

Marketing, role datasets, or exports should live in a canonical package or external store—avoid duplication.

Why
----

Large files bloat clones and CI caches, slow reviews, and risk drift for duplicated datasets.

Checklist
---------

- [ ] Is this file required at runtime or for docs?
- [ ] Can it be generated or fetched?
- [ ] If unavoidable, documented in the PR and added to an allowlist.
