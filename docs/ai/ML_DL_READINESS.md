# ML/DL Readiness

This repo supports plug-and-play ML/DL alongside LLM via:
- `ai/adapters/` — unified interface
- `ai/registry/models.yaml` — model catalog
- `configs/compute.yaml` — where inference/training runs
- `data/` — ingestion + anonymization stubs

How to add a model:
1) Implement an adapter in `ai/adapters/*.py` (subclass `AIModelAdapter`)
2) Register it in `ai/registry/models.yaml`
3) Call via registry: `registry.infer("<model-key>", cfg, input)`
