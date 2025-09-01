# Stub anonymizer: drop PII fields by simple rules
PII_FIELDS = {"email","phone","ssn","name"}

def anonymize(record: dict):
    return {k: ("<redacted>" if k.lower() in PII_FIELDS else v) for k,v in record.items()}
