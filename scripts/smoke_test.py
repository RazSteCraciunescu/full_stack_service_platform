#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

BASE_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://127.0.0.1:4174"


def get_json(path: str) -> dict:
    request = urllib.request.Request(f"{BASE_URL}{path}", headers={"Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=5) as response:
        if response.status != 200:
            raise RuntimeError(f"{path} returned HTTP {response.status}")
        return json.load(response)


def main() -> int:
    try:
        health = get_json("/api/health")
        requests = get_json("/api/requests")
        metrics = get_json("/api/metrics")
    except (OSError, urllib.error.URLError, ValueError, RuntimeError) as error:
        print(f"Smoke test failed: {error}", file=sys.stderr)
        return 1

    checks = {
        "health": health.get("status") == "ok",
        "seed requests": requests.get("total", 0) >= 8,
        "metrics total": metrics.get("total") == requests.get("total"),
    }
    failures = [name for name, passed in checks.items() if not passed]
    if failures:
        print(f"Smoke test failed: {', '.join(failures)}", file=sys.stderr)
        return 1
    print(f"Smoke test passed against {BASE_URL} ({requests['total']} requests).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
