import argparse, json, os
from .client import WorkBuoy

def main():
    p = argparse.ArgumentParser("wb")
    p.add_argument("--base-url", default=os.environ.get("API_BASE_URL","http://localhost:3000"))
    p.add_argument("--api-key", default=os.environ.get("API_KEY","dev-123"))
    p.add_argument("--tenant-id", default=os.environ.get("TENANT_ID","demo-tenant"))
    p.add_argument("resource", choices=["pipelines","contacts","opportunities"])
    p.add_argument("action", choices=["list"])
    args = p.parse_args()
    c = WorkBuoy(args.base_url, args.api_key, args.tenant_id)
    data = getattr(c, args.resource).list()
    print(json.dumps(data, indent=2))
