import threading, time
from http.server import HTTPServer, BaseHTTPRequestHandler
from workbuoy_adaptive.client import AdaptiveClient

class Handler(BaseHTTPRequestHandler):
    capacity_qps = 3
    tokens = 3
    last = time.time()
    flips_at = None

    def do_GET(self):
        now = time.time()
        # flip capacity after first 2s
        if Handler.flips_at is None:
            Handler.flips_at = now + 2
        if now > Handler.flips_at:
            Handler.capacity_qps = 15
        add = (now - Handler.last) * Handler.capacity_qps
        Handler.tokens = min(Handler.capacity_qps, Handler.tokens + add)
        Handler.last = now
        if Handler.tokens >= 1:
            Handler.tokens -= 1
            self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
        else:
            self.send_response(429); self.send_header('Retry-After','0.2'); self.end_headers(); self.wfile.write(b"slow")

def run_server(srv):
    srv.serve_forever()

def test_adaptive_up_down(tmp_path):
    srv = HTTPServer(('127.0.0.1', 0), Handler)
    t = threading.Thread(target=run_server, args=(srv,), daemon=True); t.start()
    port = srv.server_address[1]
    c = AdaptiveClient(max_qps=20, min_qps=1, burst=10)

    end1 = time.time()+2.5
    while time.time() < end1:
        c.request('GET', f'http://127.0.0.1:{port}/')
    low_qps = c.get_target_qps()

    end2 = time.time()+2.0
    while time.time() < end2:
        c.request('GET', f'http://127.0.0.1:{port}/')
    high_qps = c.get_target_qps()

    srv.shutdown()

    assert low_qps < 8
    assert high_qps > low_qps
