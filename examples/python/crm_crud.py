import os, requests, sys, json

BASE_URL = os.environ.get('BASE_URL', 'http://127.0.0.1:45860')
API_KEY = os.environ.get('API_KEY', 'dev')
TENANT_ID = os.environ.get('TENANT_ID', 't1')

headers = {'content-type':'application/json', 'x-api-key': API_KEY, 'x-tenant-id': TENANT_ID, 'x-user-role':'admin'}

# CREATE
r = requests.post(f"{BASE_URL}/api/v1/crm/contacts", headers=headers, json={"name":"Py Example","email":"py@example.com"})
r.raise_for_status()
created = r.json()
print("Created:", created)

# UPDATE
r = requests.patch(f"{BASE_URL}/api/v1/crm/contacts/{created['id']}", headers=headers, json={"phone":"+4711122233"})
r.raise_for_status()
updated = r.json()
print("Updated:", updated)

# GET
r = requests.get(f"{BASE_URL}/api/v1/crm/contacts/{created['id']}", headers=headers)
r.raise_for_status()
print("Fetched:", r.json())
