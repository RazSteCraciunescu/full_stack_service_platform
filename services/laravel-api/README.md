# Laravel API implementation

An installable Laravel 12 API that implements the same service-request vocabulary as the main Node API. It demonstrates Form Requests, API Resources, Eloquent models, migrations, factories and feature tests without pretending that two transactional backends should run in production at the same time.

```bash
cd services/laravel-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8001
```

For a quick local test without MySQL, set `DB_CONNECTION=sqlite`, set `DB_DATABASE` to an absolute path, and create an empty SQLite file before migrating. The separate MySQL scripts under `database/mysql/` document the shared relational model.
