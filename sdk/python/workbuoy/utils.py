import time, uuid
import requests

def with_timeout(session: requests.Session, method: str, url: str, timeout: int = 15, **kwargs):
    return session.request(method, url, timeout=timeout, **kwargs)

def ensure_idempotency(headers: dict):
    headers = dict(headers or {})
    headers.setdefault("Idempotency-Key", str(uuid.uuid4()))
    return headers
