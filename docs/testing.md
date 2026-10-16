# Testing strategy

The project uses several small test layers instead of one oversized suite.

## Core quality gate

```bash
npm install
npm run qa
```

The command performs:

1. strict TypeScript compilation for the Node server;
2. repository and fixture validation;
3. JavaScript syntax checks;
4. Node unit and HTTP integration tests;
5. recursive PHP syntax checks;
6. standalone PHP validator tests;
7. Python reporting unit tests.

## Node tests

```bash
npm test
```

Coverage includes:

- valid and invalid request payloads;
- enum-filter rejection;
- create, update, comment and reset flows;
- defensive cloning in the in-memory store;
- queue metric calculations;
- static MIME types and traversal protection;
- security and request-tracing headers;
- unknown routes and malformed JSON.

Coverage output can be produced with Node's built-in runner:

```bash
npm run test:coverage
```

## Browser tests

```bash
npx playwright install chromium
npm run test:e2e
```

The Playwright suite runs desktop and mobile Chromium projects. It verifies:

- the seeded dashboard and API connection state;
- search and request-detail behavior;
- request creation through the native dialog.

The browser suite resets demo data before each test so tests remain independent.

## Python tests

The reporting calculations are pure functions. This keeps the important logic testable without starting FastAPI.

```bash
python scripts/run_python_tests.py
```

## PHP tests

```bash
php scripts/check-php-syntax.php
php services/php-webhook/tests/validator_test.php
```

The Laravel feature tests require Composer dependencies:

```bash
cd services/laravel-api
composer install
php artisan test
```

## Smoke test

With the Node server running:

```bash
python scripts/smoke_test.py
```

A different base URL can be passed as the first argument.

## Manual exploratory checklist

- Resize the portal below 760 px and verify the navigation drawer.
- Use only the keyboard to open, submit and close the new-request dialog.
- Search by ID, title, requester and Romanian diacritics.
- Combine status, priority and category filters.
- Export an empty result and a non-empty CSV result.
- Change status, priority and assignee in the detail panel.
- Add a comment containing HTML-like characters and verify it renders as text.
- Reset the demo and verify modifications disappear.
- Open each optional client and compare its data with `/api/requests`.
- Stop the server and confirm each client displays a useful failure state.
