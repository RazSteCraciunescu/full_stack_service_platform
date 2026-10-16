# Contributing

This repository is intentionally small enough to review locally. Contributions should preserve that property.

## Before opening a change

1. Create a focused branch.
2. Keep generated secrets, local databases, IDE caches and dependency folders out of Git.
3. Update the OpenAPI contract when an endpoint or payload changes.
4. Add or update tests for behavior changes.
5. Run the core quality gate:

```bash
npm install
npm run qa
```

Run Playwright separately when browser behavior changes:

```bash
npx playwright install chromium
npm run test:e2e
```

## Style

- Prefer explicit names over abbreviations.
- Keep validation at application boundaries.
- Use parameterized SQL.
- Preserve keyboard access, labels and visible focus states.
- Do not add a framework merely to duplicate existing behavior.
- Keep sample data fictional and use the reserved `.test` email domain.

## Commit examples

```text
feat(api): add category filter
fix(portal): keep focus inside request dialog
test(mysql): cover overdue queue view
docs(azure): clarify manual deployment inputs
```
