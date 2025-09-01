class AIModelAdapter:
    """Unified interface for LLM/ML/DL models."""
    name = "base"

    def __init__(self, **kwargs):
        self.config = kwargs

    def predict(self, inp):
        """Return model output given an input dictionary/string."""
        raise NotImplementedError

    def train(self, dataset):
        """Optional: train or fine-tune model."""
        raise NotImplementedError

    def info(self):
        return {"name": self.name, "config": self.config}
