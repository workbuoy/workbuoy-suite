from workbuoy_sdk import Client

client = Client(base_url="http://localhost:3000/api/v1")

c = client.create_contact({ "name": "Bob", "email": "bob@example.com" })
print("Created", c)
lst = client.list_contacts(limit=10)
print("List", lst["items"])
