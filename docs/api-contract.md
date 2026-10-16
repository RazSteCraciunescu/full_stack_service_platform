# API contract

The canonical machine-readable files are:

- `api/openapi.json`
- `api/openapi.yaml`

The JSON file is also served at `/api/openapi.json`.

## Conventions

- JSON is used for request and response bodies.
- Collection responses use `{ "items": [...], "total": number }`.
- Public request identifiers use the `SR-####` format.
- Timestamps use ISO 8601 strings.
- Partial workflow updates use `PATCH`.
- Validation problems return a stable error envelope.
- Every response includes an `X-Request-Id` header.

## Error envelope

```json
{
  "error": {
    "code": "validation_failed",
    "message": "The request could not be created.",
    "details": {
      "title": "Title must contain between 8 and 120 characters."
    }
  }
}
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness and service metadata |
| GET | `/api/frameworks` | Lists the included client implementations |
| GET | `/api/requests` | Lists and filters requests |
| POST | `/api/requests` | Creates a request |
| GET | `/api/requests/{id}` | Returns one request |
| PATCH | `/api/requests/{id}` | Updates workflow fields |
| POST | `/api/requests/{id}/comments` | Adds a comment |
| GET | `/api/metrics` | Returns queue metrics |
| GET | `/api/knowledge-articles` | Returns sample self-service content |
| POST | `/api/demo/reset` | Restores deterministic sample data |

## List filters

`GET /api/requests` accepts:

- `q`
- `status`
- `priority`
- `category`
- `assignee`

Enum filters reject unsupported values with HTTP 400. They are not silently ignored.

## Status codes

| Status | Meaning |
|---|---|
| 200 | Successful read or update |
| 201 | Resource created |
| 204 | CORS preflight completed |
| 400 | Invalid JSON or unsupported filter |
| 404 | Route or request not found |
| 413 | Request body exceeds the size limit |
| 422 | Valid JSON failed field validation |
| 500 | Unexpected server failure |
