from ai.adapters.base import AIModelAdapter
from ai.adapters.llm_openai import OpenAILLMAdapter
from ai.adapters.sklearn_stub import SklearnClassifierAdapter
from ai.adapters.torch_stub import TorchDLAdapter

def test_interfaces():
    for cls in (OpenAILLMAdapter, SklearnClassifierAdapter, TorchDLAdapter):
        m = cls()
        out = m.predict({"prompt":"hello"})
        assert isinstance(out, dict)
