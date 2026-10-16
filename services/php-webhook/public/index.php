<?php

declare(strict_types=1);

use ServicePortal\JsonResponse;
use ServicePortal\RequestValidator;

require_once dirname(__DIR__) . '/src/JsonResponse.php';
require_once dirname(__DIR__) . '/src/RequestValidator.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if ($method === 'GET' && $path === '/health') {
    JsonResponse::send(200, ['status' => 'ok', 'service' => 'php-webhook']);
}

if ($method !== 'POST' || $path !== '/webhooks/requests') {
    JsonResponse::send(404, [
        'error' => ['code' => 'not_found', 'message' => 'Route not found.'],
    ]);
}

$raw = file_get_contents('php://input');
try {
    $input = json_decode($raw === false ? '' : $raw, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    JsonResponse::send(400, [
        'error' => ['code' => 'invalid_json', 'message' => 'Request body must contain valid JSON.'],
    ]);
}

if (!is_array($input)) {
    JsonResponse::send(400, [
        'error' => ['code' => 'invalid_body', 'message' => 'A JSON object is required.'],
    ]);
}

$result = (new RequestValidator())->validate($input);
if (!$result['valid']) {
    JsonResponse::send(422, [
        'error' => [
            'code' => 'validation_failed',
            'message' => 'The request was rejected.',
            'details' => $result['errors'],
        ],
    ]);
}

JsonResponse::send(202, [
    'accepted' => true,
    'reference' => 'HOOK-' . strtoupper(bin2hex(random_bytes(4))),
    'request' => $result['value'],
]);
