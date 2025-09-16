# API bridge

Legacy components calling `api(path, method, body, headers)` will now work.
Internally this forwards to `apiFetch(path, opts)`.
