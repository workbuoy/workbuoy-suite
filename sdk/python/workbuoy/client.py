import requests
from .utils import with_timeout, ensure_idempotency

class WorkBuoy:
    def __init__(self, base_url: str, api_key: str, tenant_id: str, timeout_s: int = 15):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.tenant_id = tenant_id
        self.timeout_s = timeout_s
        self._session = requests.Session()

    def _headers(self):
        return {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "x-tenant-id": self.tenant_id,
        }

    def _get(self, path: str):
        r = with_timeout(self._session, "GET", f"{self.base_url}{path}", timeout=self.timeout_s, headers=self._headers())
        r.raise_for_status()
        return r.json()

    def _mutate(self, method: str, path: str, json_body: dict):
        headers = ensure_idempotency(self._headers())
        r = with_timeout(self._session, method, f"{self.base_url}{path}", timeout=self.timeout_s, headers=headers, json=json_body)
        r.raise_for_status()
        return r.json()

    class _Pipelines:
        def __init__(self, client: "WorkBuoy"): self.client = client
        def list(self): return self.client._get("/api/v1/crm/pipelines")
        def create(self, data: dict): return self.client._mutate("POST", "/api/v1/crm/pipelines", data)
        def update(self, id: str, data: dict): return self.client._mutate("PUT", f"/api/v1/crm/pipelines/{id}", data)
        def patch(self, id: str, data: dict): return self.client._mutate("PATCH", f"/api/v1/crm/pipelines/{id}", data)

    class _Contacts:
        def __init__(self, client: "WorkBuoy"): self.client = client
        def list(self, limit: int = 20, cursor: str | None = None):
            qs = []
            if limit: qs.append(f"limit={limit}")
            if cursor: qs.append(f"cursor={cursor}")
            q = ("?" + "&".join(qs)) if qs else ""
            return self.client._get(f"/api/v1/crm/contacts{q}")
        def create(self, data: dict): return self.client._mutate("POST", "/api/v1/crm/contacts", data)
        def update(self, id: str, data: dict): return self.client._mutate("PUT", f"/api/v1/crm/contacts/{id}", data)
        def patch(self, id: str, data: dict): return self.client._mutate("PATCH", f"/api/v1/crm/contacts/{id}", data)

    class _Opportunities:
        def __init__(self, client: "WorkBuoy"): self.client = client
        def list(self, limit: int = 20, cursor: str | None = None):
            qs = []
            if limit: qs.append(f"limit={limit}")
            if cursor: qs.append(f"cursor={cursor}")
            q = ("?" + "&".join(qs)) if qs else ""
            return self.client._get(f"/api/v1/crm/opportunities{q}")
        def create(self, data: dict): return self.client._mutate("POST", "/api/v1/crm/opportunities", data)
        def update(self, id: str, data: dict): return self.client._mutate("PUT", f"/api/v1/crm/opportunities/{id}", data)
        def patch(self, id: str, data: dict): return self.client._mutate("PATCH", f"/api/v1/crm/opportunities/{id}", data)

    @property
    def pipelines(self): return WorkBuoy._Pipelines(self)
    @property
    def contacts(self): return WorkBuoy._Contacts(self)
    @property
    def opportunities(self): return WorkBuoy._Opportunities(self)
