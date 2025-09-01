from workbuoy import WorkBuoy

def test_construct():
    c = WorkBuoy(base_url="http://localhost:3000", api_key="k", tenant_id="t")
    assert c is not None
