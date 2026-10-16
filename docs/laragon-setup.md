# Laragon setup on Windows

Laragon is an optional convenience layer. The root Node application does not require Apache, PHP or MySQL, and it also runs on macOS and Linux.

## Setup

1. Place the repository in Laragon's document root, normally `C:\laragon\www\full-stack-service-request-platform`.
2. Open **Menu → Laragon → Terminal** so the isolated Node, PHP, Python, Composer and MySQL tools are available.
3. At the repository root, run `npm run build` once and then `npm start`.
4. Open `http://127.0.0.1:4174`.
5. To use MySQL, start it from Laragon and execute the scripts in `database\mysql` in numeric order.
6. To expose the Laravel API through a Laragon virtual host, install its Composer dependencies inside `services\laravel-api`, then point the generated web root to that application's `public` directory.

## Procfile option

`laragon/Procfile.example` contains process-manager entries for the Node, PHP and Python services. Adjust each `PWD` value before copying an entry into Laragon's Procfile. Only the Node API is needed for the main preview.

## Scope

Laragon is Windows-specific and optional. Check its current license terms before using it in a commercial setting. The repository's code and all non-Laragon run paths remain platform-neutral.

Official documentation:

- https://laragon.org/docs/install
- https://laragon.org/docs/procfile
- https://laragon.org/docs/directory-structure
