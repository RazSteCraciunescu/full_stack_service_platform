# PHP webhook service

A small dependency-free PHP 8.2 endpoint for systems that submit service requests through a webhook. Validation intentionally mirrors the Node API contract.

```bash
cd services/php-webhook
php -S 127.0.0.1:8080 -t public
```

```bash
curl -X POST http://127.0.0.1:8080/webhooks/requests \
  -H "Content-Type: application/json" \
  --data '{"title":"Invoice export is missing owner column","description":"The monthly export omits the owner column for resolved requests.","category":"Data Export","priority":"Medium","requester":{"name":"Alex Morgan","email":"alex.morgan@example.test"}}'
```

The endpoint validates and acknowledges data; it does not forward or persist it. Run `php tests/validator_test.php` for the dependency-free test suite.
