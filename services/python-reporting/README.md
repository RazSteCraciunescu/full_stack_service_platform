# Python reporting service

A small FastAPI service that demonstrates typed HTTP endpoints and reporting logic without duplicating the transactional Node API.

```bash
cd services/python-reporting
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Useful routes:

- `GET /health`
- `GET /reports/summary`
- `GET /reports/priority-backlog?limit=10`
- `GET /docs` for FastAPI's OpenAPI interface

The default data path points to the root `data/requests.json`. Set `REQUEST_DATA_PATH` to use another fixture or export.
