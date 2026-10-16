USE service_portal;

CREATE OR REPLACE VIEW request_queue AS
SELECT
  request.public_id,
  request.title,
  request.category,
  request.priority,
  request.status,
  requester.display_name AS requester,
  agent.display_name AS assignee,
  request.channel,
  request.due_at,
  request.updated_at,
  CASE
    WHEN request.status IN ('Resolved', 'Closed') THEN 'complete'
    WHEN request.due_at IS NOT NULL AND request.due_at < UTC_TIMESTAMP() THEN 'overdue'
    WHEN request.assignee_id IS NULL THEN 'unassigned'
    ELSE 'on_track'
  END AS service_health
FROM service_requests request
JOIN users requester ON requester.id = request.requester_id
LEFT JOIN users agent ON agent.id = request.assignee_id;

CREATE OR REPLACE VIEW weekly_service_metrics AS
SELECT
  YEARWEEK(created_at, 3) AS iso_week,
  COUNT(*) AS created_count,
  SUM(status IN ('Resolved', 'Closed')) AS resolved_count,
  ROUND(AVG(satisfaction), 1) AS average_satisfaction
FROM service_requests
GROUP BY YEARWEEK(created_at, 3);
