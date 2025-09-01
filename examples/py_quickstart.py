from sdk.python.src.workbuoy_sdk import WorkBuoyClient

c = WorkBuoyClient('dev-123','demo')
print(c.list_contacts())
