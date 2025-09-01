import requests
class AdaptiveClient:
    def __init__(self, max_qps=20, min_qps=1, burst=10): pass
    def request(self, method, url, **kwargs): return requests.request(method, url, **kwargs)
