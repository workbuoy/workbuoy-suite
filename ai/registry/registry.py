import importlib

def load(adapter_path: str, **cfg):
    module_path, class_name = adapter_path.rsplit(".", 1)
    mod = importlib.import_module(module_path)
    cls = getattr(mod, class_name)
    return cls(**cfg)

def infer(model_key: str, models_cfg: dict, inp):
    m = models_cfg["models"][model_key]
    adapter = load(m["adapter"], **(m.get("config") or {}))
    return adapter.predict(inp)
