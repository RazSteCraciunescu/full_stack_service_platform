USE service_portal;

INSERT INTO users (id, display_name, email, role) VALUES
  (1, 'Mia Carter', 'mia.carter@example.test', 'requester'),
  (2, 'Theo Martin', 'theo.martin@example.test', 'requester'),
  (3, 'Elena Pop', 'elena.pop@example.test', 'requester'),
  (10, 'Jordan Lee', 'jordan.lee@example.test', 'agent'),
  (11, 'Priya Shah', 'priya.shah@example.test', 'agent'),
  (12, 'Sam Brooks', 'sam.brooks@example.test', 'agent')
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  role = VALUES(role);

INSERT INTO service_requests (
  id, public_id, title, description, category, priority, status,
  requester_id, assignee_id, channel, due_at, created_at, updated_at
) VALUES
  (
    1,
    'SR-1042',
    'Password reset email never arrives',
    'Customers can request a password reset, but the message is not delivered for migrated accounts.',
    'Account',
    'High',
    'In Progress',
    1,
    10,
    'Portal',
    '2026-08-30 17:00:00',
    '2026-08-24 09:18:00',
    '2026-08-29 13:42:00'
  ),
  (
    2,
    'SR-1041',
    'Invoice PDF shows the previous office address',
    'Newly generated invoice PDFs still use the address from the retired template.',
    'Billing',
    'Medium',
    'Waiting',
    2,
    11,
    'Email',
    '2026-09-01 12:00:00',
    '2026-08-25 11:06:00',
    '2026-08-28 15:20:00'
  ),
  (
    3,
    'SR-1039',
    'CSV export drops Romanian diacritics',
    'Names containing Romanian diacritics are replaced by question marks in some spreadsheet applications.',
    'Data Export',
    'High',
    'In Progress',
    3,
    12,
    'API',
    '2026-08-29 16:00:00',
    '2026-08-22 14:30:00',
    '2026-08-29 08:10:00'
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  updated_at = VALUES(updated_at);

INSERT IGNORE INTO request_tags (request_id, tag) VALUES
  (1, 'email'),
  (1, 'authentication'),
  (2, 'invoice'),
  (2, 'pdf'),
  (3, 'csv'),
  (3, 'i18n');

INSERT IGNORE INTO request_comments (id, request_id, author_id, body, created_at) VALUES
  (1, 1, 10, 'Reproduced with one migrated account. Checking the queue payload next.', '2026-08-29 13:42:00');
