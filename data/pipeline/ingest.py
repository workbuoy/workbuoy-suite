# Stub ingestion: collect rows from sources and write to data/raw/*.jsonl
import os, json, datetime
RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
os.makedirs(RAW, exist_ok=True)

def write_event(event: dict):
    fn = os.path.join(RAW, f"events_{datetime.date.today().isoformat()}.jsonl")
    with open(fn, "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False)+"\n")
    return fn
