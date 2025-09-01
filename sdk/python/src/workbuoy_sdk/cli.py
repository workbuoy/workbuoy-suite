import argparse, json
from .client import WorkBuoyClient

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--api-key', required=True)
    parser.add_argument('--tenant-id', required=True)
    parser.add_argument('--base-url', default='http://localhost:3000')
    args = parser.parse_args()
    c = WorkBuoyClient(args.api_key, args.tenant_id, args.base_url)
    res = c.list_contacts()
    print(json.dumps(res, indent=2))
