-- Queue ordered for triage: urgent first, then oldest update.
SELECT public_id, title, priority, status, assignee, due_at, service_health
FROM request_queue
WHERE status NOT IN ('Resolved', 'Closed')
ORDER BY FIELD(priority, 'Urgent', 'High', 'Medium', 'Low'), updated_at;

-- Workload by agent.
SELECT
  COALESCE(agent.display_name, 'Unassigned') AS owner,
  COUNT(*) AS active_requests
FROM service_requests request
LEFT JOIN users agent ON agent.id = request.assignee_id
WHERE request.status NOT IN ('Resolved', 'Closed')
GROUP BY agent.display_name
ORDER BY active_requests DESC, owner;

-- Search the knowledge base.
SELECT slug, title, summary
FROM knowledge_articles
WHERE MATCH(title, summary)
  AGAINST ('password reset' IN NATURAL LANGUAGE MODE)
ORDER BY updated_at DESC;
