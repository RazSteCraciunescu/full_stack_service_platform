# MySQL model

The SQL files provide a normalized alternative to the root in-memory demo:

1. `001_schema.sql` creates users, service requests, tags, comments and knowledge articles.
2. `002_seed.sql` inserts deterministic sample data and can be run repeatedly.
3. `003_views.sql` adds queue and weekly-metric views.
4. `useful_queries.sql` contains triage, workload and search examples.

Run the optional database profile from the repository root:

```bash
docker compose --profile database up -d mysql
```

Then connect to `127.0.0.1:3307` with database, username and password `service_portal`. These are local demo values only; use secret-managed credentials outside a workstation.
