# Technology map

This page maps each technology to a concrete purpose and location. It also identifies whether the code is part of the default runtime or an optional learning path.

## Frontend

| Technology | Location | Purpose | Runtime status |
|---|---|---|---|
| HTML | `public/*.html`, `apps/fundamentals` | Landmarks, forms, tables, dialogs and content structure | Default |
| CSS | `public/styles.css` and client styles | Responsive layout, Grid, Flexbox, states and focus treatment | Default |
| Sass | `apps/react-client/src/styles`, `apps/fundamentals/styles` | Tokens, partials and nested component styles | Source example |
| JavaScript | `public/app.js`, `apps/fundamentals/src/app.js` | Fetch, DOM updates, events, export and local storage | Default |
| TypeScript | `server/src`, React and Vue sources | Domain types, validation and typed API clients | Default server source |
| React | `apps/react-client` | Hooks, components, controlled filters, dialog and workflow editing | Optional client |
| Bootstrap | `apps/react-client` | Utility classes, buttons, tables and alerts alongside custom Sass | Optional client |
| Vue.js | `apps/vue-dashboard`, `public/vue` | Composition API source and ready analytics view | Ready optional client |
| AngularJS | `apps/angularjs-admin`, `public/angularjs` | Legacy controller/service maintenance example | Legacy optional client |

AngularJS is deliberately not presented as a new-application recommendation. Its official long-term support ended in January 2022, but understanding it remains useful when maintaining older systems.

## Backend

| Technology | Location | Purpose | Runtime status |
|---|---|---|---|
| Node.js | `server/src` | Main HTTP server and static-file host | Default |
| TypeScript | `server/src` | API implementation with strict compilation | Default source |
| Python | `services/python-reporting` | Reporting and prioritization functions | Optional service |
| FastAPI | `services/python-reporting/app/main.py` | Typed reporting endpoints and generated API docs | Optional service |
| PHP | `services/php-webhook` | Dependency-free webhook and validation example | Optional service |
| Laravel | `services/laravel-api` | Framework CRUD API, Form Requests, Resources and tests | Optional service |

## Data and API tooling

| Technology | Location | Purpose |
|---|---|---|
| MySQL 8 | `database/mysql` | Normalized durable model, views and query examples |
| JSON fixtures | `data` | Deterministic no-database runtime data |
| REST | `server/src/server.ts` | Resource-oriented HTTP operations and status codes |
| OpenAPI | `api/openapi.json`, `api/openapi.yaml` | Machine-readable endpoint contract |
| Postman | `api/postman` | Importable collection and local environment |
| Docker | `Dockerfile`, `compose.yaml` | Portable app image and optional MySQL profile |

## Local and cloud tooling

| Technology | Location | Purpose |
|---|---|---|
| Laragon | `docs/laragon-setup.md`, `laragon/Procfile.example` | Optional Windows environment for PHP, MySQL and process launch |
| Azure App Service | `infra/azure/main.bicep` | Linux web-app deployment for the Node build |
| Azure Bicep | `infra/azure` | Repeatable resource-group infrastructure |
| Azure Pipelines | `azure-pipelines.yml` | Build, quality gate and artifact publication |
| GitHub Actions | `.github/workflows` | Cross-platform core validation and optional deployment |

Azure resources are examples only. Local execution remains the default so no subscription or paid resource is required.
