import os
from sdk.python.workbuoy.client import WorkBuoy

client = WorkBuoy(
    base_url=os.environ.get("API_BASE_URL","http://localhost:3000"),
    api_key=os.environ.get("API_KEY","dev-123"),
    tenant_id=os.environ.get("TENANT_ID","demo-tenant"),
)

print(client.contacts.list(limit=5))
