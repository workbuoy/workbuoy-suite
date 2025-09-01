# After generating SDK into sdk/gen/python
import os, requests

base = os.getenv('API_BASE_URL','http://localhost:3000')
headers = {'x-api-key': os.getenv('API_KEY','dev-123'), 'x-tenant-id': os.getenv('TENANT_ID','demo-tenant')}

r = requests.get(f"{base}/api/v1/crm/contacts?limit=10", headers=headers)
print(r.json())
