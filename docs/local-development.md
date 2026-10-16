# Local development

## Fastest path

With Node.js 22 or newer:

```bash
node dist/server/src/server.js
```

The server binds to `127.0.0.1:4174` by default.

Environment overrides:

```bash
HOST=0.0.0.0 PORT=8080 node dist/server/src/server.js
```

On Windows Command Prompt:

```bat
set HOST=0.0.0.0
set PORT=8080
node dist\server\src\server.js
```

Use `HOST=0.0.0.0` only when another device or container needs to connect. Review the operating-system firewall before exposing a local service to the network.

## Source development

```bash
npm install
npm run build
npm run dev
```

`npm run dev` recompiles once and uses Node's watch mode for the generated server. The browser files under `public/` do not need a bundler; refresh after editing them.

## React client

Terminal 1:

```bash
npm start
```

Terminal 2:

```bash
cd apps/react-client
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` to the Node server.

## Vue client

```bash
cd apps/vue-dashboard
npm install
npm run dev
```

Open `http://127.0.0.1:5174`. The checked-in `/vue/` page remains available from the main server without this build step.

## AngularJS client

The ready client is available at `/angularjs/`. Its AngularJS runtime is loaded from cdnjs; a visible fallback is shown if the external script cannot load.

For source-level unit tests:

```bash
cd apps/angularjs-admin
npm install
npm test
```

## Python reporting service

```bash
cd services/python-reporting
python -m venv .venv
```

Activate the environment, then:

```bash
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Open `http://127.0.0.1:8000/docs` for FastAPI's generated API documentation.

## PHP webhook

```bash
php -S 127.0.0.1:8080 -t services/php-webhook/public
```

Test it with the request from `services/php-webhook/README.md`.

## Laravel API

Follow `services/laravel-api/README.md`. It defaults to SQLite for a low-setup learning path and can be pointed to the included MySQL schema for further work.

## MySQL profile

```bash
docker compose --profile database up -d mysql
```

Connect to `127.0.0.1:3307` using the local demo values from `.env.example`. The schema scripts run automatically for a new Docker volume.

Remove the local database:

```bash
docker compose --profile database down -v
```
