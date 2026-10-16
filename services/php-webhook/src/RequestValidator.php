<?php

declare(strict_types=1);

namespace ServicePortal;

final class RequestValidator
{
    private const CATEGORIES = [
        'Account',
        'Attachments',
        'Billing',
        'Data Export',
        'Documentation',
        'Feature Request',
        'Notifications',
        'Usability',
    ];

    private const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

    /**
     * @param array<string, mixed> $input
     * @return array{valid: bool, value: array<string, mixed>, errors: array<string, string>}
     */
    public function validate(array $input): array
    {
        $title = trim((string) ($input['title'] ?? ''));
        $description = trim((string) ($input['description'] ?? ''));
        $category = trim((string) ($input['category'] ?? ''));
        $priority = trim((string) ($input['priority'] ?? ''));
        $requester = is_array($input['requester'] ?? null) ? $input['requester'] : [];
        $requesterName = trim((string) ($requester['name'] ?? ''));
        $requesterEmail = strtolower(trim((string) ($requester['email'] ?? '')));
        $errors = [];

        if (strlen($title) < 8 || strlen($title) > 120) {
            $errors['title'] = 'Title must contain between 8 and 120 characters.';
        }
        if (strlen($description) < 20 || strlen($description) > 2000) {
            $errors['description'] = 'Description must contain between 20 and 2000 characters.';
        }
        if (!in_array($category, self::CATEGORIES, true)) {
            $errors['category'] = 'Choose a supported category.';
        }
        if (!in_array($priority, self::PRIORITIES, true)) {
            $errors['priority'] = 'Choose Low, Medium, High or Urgent.';
        }
        if (strlen($requesterName) < 2 || strlen($requesterName) > 80) {
            $errors['requester.name'] = 'Requester name must contain between 2 and 80 characters.';
        }
        if (filter_var($requesterEmail, FILTER_VALIDATE_EMAIL) === false) {
            $errors['requester.email'] = 'Enter a valid requester email address.';
        }

        $tags = [];
        if (isset($input['tags'])) {
            if (!is_array($input['tags'])) {
                $errors['tags'] = 'Tags must be an array.';
            } else {
                foreach ($input['tags'] as $tag) {
                    $clean = trim((string) $tag);
                    if ($clean !== '' && !in_array($clean, $tags, true)) {
                        $tags[] = $clean;
                    }
                }
                if (count($tags) > 8 || array_filter($tags, static fn (string $tag): bool => strlen($tag) > 30)) {
                    $errors['tags'] = 'Use no more than eight tags of 30 characters each.';
                }
                $tags = array_slice($tags, 0, 8);
            }
        }

        return [
            'valid' => $errors === [],
            'value' => [
                'title' => $title,
                'description' => $description,
                'category' => $category,
                'priority' => $priority,
                'requester' => [
                    'name' => $requesterName,
                    'email' => $requesterEmail,
                ],
                'tags' => $tags,
            ],
            'errors' => $errors,
        ];
    }
}
