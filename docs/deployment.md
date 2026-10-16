# Deployment options

Local execution is the primary supported path. The files below demonstrate how the same build can be packaged without making a cloud account mandatory.

## Standalone Node process

```bash
HOST=0.0.0.0 PORT=4174 node dist/server/src/server.js
```

Place a reverse proxy and TLS termination in front of the process for internet-facing use. Add authentication, durable storage and production monitoring first.

## Docker

Build and run the application:

```bash
docker compose up --build app
```

Open `http://127.0.0.1:4174`.

Start the optional MySQL profile:

```bash
docker compose --profile database up -d
```

The Node app still uses memory unless storage selection is wired deliberately. Starting MySQL does not silently change application behavior.

## Azure App Service

`infra/azure/main.bicep` creates a small Linux App Service plan and web app with:

- HTTPS-only access;
- FTP disabled;
- HTTP/2 enabled;
- minimum TLS 1.2;
- `/api/health` as the health-check path;
- a Node 22 runtime command.

See `infra/azure/README.md` for commands. The template defaults to the F1 demonstration SKU, but subscription availability and quotas vary. No Azure resource is required for local use.

## Azure Pipelines

`azure-pipelines.yml` installs Node, runs the core quality gate and publishes a ZIP build artifact. It contains no service connection or deployment secret.

## GitHub Actions

- `ci.yml` runs the core checks on Linux and Windows.
- `browser.yml` runs Playwright in Chromium.
- `azure-deploy.yml` is manually triggered and requires a configured Azure login secret.

## Pre-production checklist

- Replace in-memory storage with a durable repository.
- Add centralized authentication and role-based authorization.
- Restrict CORS to known origins.
- Add rate limiting and abuse controls.
- Move configuration and secrets to a managed secret store.
- Add dependency, container and infrastructure scanning.
- Define backup, migration and rollback procedures.
- Send structured logs and metrics to an approved observability platform.
- Review privacy, retention and incident-response requirements.
