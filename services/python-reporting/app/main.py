from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .reporting import build_summary, priority_backlog

app = FastAPI(
    title="Service Portal Reporting API",
    version="1.0.0",
    description="A Python/FastAPI reporting view over the shared request data.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://127.0.0.1:4174").split(",")
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept"],
)


def data_path() -> Path:
    configured = os.getenv("REQUEST_DATA_PATH")
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[3] / "data" / "requests.json"


def load_requests() -> list[dict[str, Any]]:
    path = data_path()
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=503, detail="Request data is unavailable.") from error
    if not isinstance(data, list):
        raise HTTPException(status_code=503, detail="Request data must contain a JSON array.")
    return data


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "python-reporting"}


@app.get("/reports/summary", tags=["reports"])
def summary() -> dict[str, Any]:
    return build_summary(load_requests())


@app.get("/reports/priority-backlog", tags=["reports"])
def backlog(limit: int = Query(default=10, ge=1, le=100)) -> dict[str, Any]:
    items = priority_backlog(load_requests())[:limit]
    return {"items": items, "total": len(items)}
