<?php

declare(strict_types=1);

namespace ServicePortal;

final class JsonResponse
{
    /** @param array<string, mixed> $payload */
    public static function send(int $status, array $payload): never
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        exit;
    }
}
