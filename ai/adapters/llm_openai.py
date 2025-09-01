from .base import AIModelAdapter

class OpenAILLMAdapter(AIModelAdapter):
    name = "openai-llm"

    def predict(self, inp):
        # Stub only: integrate OpenAI SDK in runtime env
        prompt = inp if isinstance(inp, str) else inp.get("prompt","")
        return {"type":"llm","model":"openai","prompt":prompt,"output":"<stubbed LLM output>"}  # replace with actual API call
