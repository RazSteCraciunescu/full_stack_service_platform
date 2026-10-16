# AngularJS maintenance client

This is deliberately a small legacy client, not the default architecture. It shows how an existing AngularJS 1.x queue can be understood, tested and changed while a newer client is developed separately.

```bash
npm install
npm start
```

Keep the root API on port `4174`, then open `http://127.0.0.1:5175`. The root application's `/angularjs/` route provides a ready-to-run browser version with a static fallback when the AngularJS CDN is unavailable.
