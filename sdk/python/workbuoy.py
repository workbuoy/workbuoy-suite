import os, json, requests

class WorkBuoyClient:
    def __init__(self, base=None, api_key=None, tenant_id=None):
        self.base = (base or os.getenv('API_BASE_URL','http://localhost:3000')).rstrip('/')
        self.h = {'x-api-key': api_key or os.getenv('API_KEY','dev-123'),
                  'x-tenant-id': tenant_id or os.getenv('TENANT_ID','demo-tenant')}

    def list_contacts(self, limit=50):
        return requests.get(f"{self.base}/api/v1/crm/contacts", params={'limit':limit}, headers=self.h).json()

    def create_contact(self, body:dict):
        return requests.post(f"{self.base}/api/v1/crm/contacts", headers={**self.h, 'Content-Type':'application/json'}, data=json.dumps(body)).json()

    def patch_contact(self, cid:str, body:dict):
        return requests.patch(f"{self.base}/api/v1/crm/contacts/{cid}", headers={**self.h, 'Content-Type':'application/json'}, data=json.dumps(body)).json()

    def list_opportunities(self, limit=50):
        return requests.get(f"{self.base}/api/v1/crm/opportunities", params={'limit':limit}, headers=self.h).json()

    def create_opportunity(self, body:dict):
        return requests.post(f"{self.base}/api/v1/crm/opportunities", headers={**self.h, 'Content-Type':'application/json'}, data=json.dumps(body)).json()

    def patch_opportunity(self, oid:str, body:dict):
        return requests.patch(f"{self.base}/api/v1/crm/opportunities/{oid}", headers={**self.h, 'Content-Type':'application/json'}, data=json.dumps(body)).json()

    def export(self, entity:str, fmt:str='json'):
        return requests.get(f"{self.base}/api/v1/crm/export", params={'entity':entity,'format':fmt}, headers=self.h).text
