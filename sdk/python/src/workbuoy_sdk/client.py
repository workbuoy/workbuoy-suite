import requests, uuid

class WorkBuoyClient:
    def __init__(self, api_key, tenant_id, base_url='http://localhost:3000', user_id='py-sdk'):
        self.api_key = api_key
        self.tenant_id = tenant_id
        self.base_url = base_url
        self.user_id = user_id

    def _headers(self, method):
        h = {
            'x-api-key': self.api_key,
            'x-tenant-id': self.tenant_id,
            'x-user-id': self.user_id,
            'Content-Type': 'application/json'
        }
        if method in ('POST','PUT','PATCH'):
            h['Idempotency-Key'] = str(uuid.uuid4())
        return h

    def list_contacts(self, limit=20, cursor=None):
        url = f"{self.base_url}/api/v1/crm/contacts?limit={limit}"
        if cursor: url += f"&cursor={cursor}"
        r = requests.get(url, headers=self._headers('GET'))
        r.raise_for_status()
        return r.json()

    def create_contact(self, data):
        url = f"{self.base_url}/api/v1/crm/contacts"
        r = requests.post(url, json=data, headers=self._headers('POST'))
        r.raise_for_status()
        return r.json()
