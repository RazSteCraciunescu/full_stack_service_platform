<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/src/RequestValidator.php';

use ServicePortal\RequestValidator;

function assertTrue(bool $condition, string $message): void
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$validator = new RequestValidator();
$valid = $validator->validate([
    'title' => 'Invoice export is missing owner column',
    'description' => 'The monthly export omits the owner column for all resolved requests.',
    'category' => 'Data Export',
    'priority' => 'Medium',
    'requester' => [
        'name' => 'Alex Morgan',
        'email' => 'ALEX.MORGAN@example.test',
    ],
    'tags' => ['csv', 'csv', 'reporting'],
]);
assertTrue($valid['valid'] === true, 'a valid payload should pass');
assertTrue($valid['value']['requester']['email'] === 'alex.morgan@example.test', 'email should be normalized');
assertTrue($valid['value']['tags'] === ['csv', 'reporting'], 'tags should be trimmed and deduplicated');

$invalid = $validator->validate([
    'title' => 'Short',
    'requester' => ['email' => 'not-an-email'],
]);
assertTrue($invalid['valid'] === false, 'an invalid payload should fail');
assertTrue(isset($invalid['errors']['title']), 'title error should be present');
assertTrue(isset($invalid['errors']['requester.email']), 'email error should be present');

echo "PHP validator tests passed.\n";
