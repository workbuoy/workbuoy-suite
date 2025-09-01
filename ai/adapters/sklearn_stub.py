from .base import AIModelAdapter

class SklearnClassifierAdapter(AIModelAdapter):
    name = "sklearn-classifier"

    def predict(self, inp):
        # Example: expects vectorized features or simple dict
        return {"type":"ml","model":"sklearn","input":inp,"prediction":"positive","confidence":0.73}
