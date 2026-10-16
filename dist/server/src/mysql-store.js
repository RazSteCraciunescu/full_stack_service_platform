function parseJson(value, fallback) {
    if (value === null)
        return fallback;
    if (typeof value !== "string")
        return value;
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
function toIso(value) {
    if (value === null)
        return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function mapRow(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        priority: row.priority,
        status: row.status,
        requester: parseJson(row.requester, { name: "Unknown", email: "unknown@example.test" }),
        assignee: row.assignee,
        channel: row.channel,
        createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
        updatedAt: toIso(row.updatedAt) ?? new Date(0).toISOString(),
        dueAt: toIso(row.dueAt),
        tags: parseJson(row.tags, []),
        satisfaction: row.satisfaction === null ? null : Number(row.satisfaction),
        comments: parseJson(row.comments, [])
    };
}
const selectRequestSql = `
  SELECT
    request.public_id AS id,
    request.title,
    request.description,
    request.category,
    request.priority,
    request.status,
    JSON_OBJECT('name', requester.display_name, 'email', requester.email) AS requester,
    agent.display_name AS assignee,
    request.channel,
    request.created_at AS createdAt,
    request.updated_at AS updatedAt,
    request.due_at AS dueAt,
    request.satisfaction,
    COALESCE(
      (SELECT JSON_ARRAYAGG(tag.tag)
       FROM request_tags tag
       WHERE tag.request_id = request.id),
      JSON_ARRAY()
    ) AS tags,
    COALESCE(
      (SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'id', CONCAT('C-', comment.id),
        'author', author.display_name,
        'body', comment.body,
        'createdAt', DATE_FORMAT(comment.created_at, '%Y-%m-%dT%H:%i:%s.000Z')
      ))
       FROM request_comments comment
       JOIN users author ON author.id = comment.author_id
       WHERE comment.request_id = request.id),
      JSON_ARRAY()
    ) AS comments
  FROM service_requests request
  JOIN users requester ON requester.id = request.requester_id
  LEFT JOIN users agent ON agent.id = request.assignee_id
`;
export class MysqlRequestStore {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    async list(filters = {}) {
        const clauses = [];
        const values = [];
        if (filters.status) {
            clauses.push("request.status = ?");
            values.push(filters.status);
        }
        if (filters.priority) {
            clauses.push("request.priority = ?");
            values.push(filters.priority);
        }
        if (filters.category) {
            clauses.push("request.category = ?");
            values.push(filters.category);
        }
        if (filters.assignee) {
            clauses.push("agent.display_name = ?");
            values.push(filters.assignee);
        }
        if (filters.q?.trim()) {
            clauses.push("(request.public_id LIKE ? OR request.title LIKE ? OR request.description LIKE ?)");
            const query = `%${filters.q.trim()}%`;
            values.push(query, query, query);
        }
        const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
        const [rows] = await this.connection.execute(`${selectRequestSql} ${where} ORDER BY request.updated_at DESC`, values);
        return rows.map(mapRow);
    }
    async get(publicId) {
        const [rows] = await this.connection.execute(`${selectRequestSql} WHERE request.public_id = ? LIMIT 1`, [publicId]);
        return rows[0] ? mapRow(rows[0]) : undefined;
    }
    async create(input) {
        const publicId = `SR-${Date.now().toString().slice(-7)}`;
        await this.connection.beginTransaction();
        try {
            await this.connection.execute(`INSERT INTO users (display_name, email, role)
         VALUES (?, ?, 'requester')
         ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)`, [input.requester.name, input.requester.email.toLowerCase()]);
            const [requesters] = await this.connection.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [input.requester.email.toLowerCase()]);
            const requesterId = requesters[0]?.id;
            if (!requesterId)
                throw new Error("Requester could not be resolved after upsert.");
            await this.connection.execute(`INSERT INTO service_requests
         (public_id, title, description, category, priority, status, requester_id, channel)
         VALUES (?, ?, ?, ?, ?, 'Open', ?, ?)`, [
                publicId,
                input.title,
                input.description,
                input.category,
                input.priority,
                requesterId,
                input.channel ?? "Portal"
            ]);
            const [requests] = await this.connection.execute("SELECT id FROM service_requests WHERE public_id = ? LIMIT 1", [publicId]);
            const requestId = requests[0]?.id;
            if (!requestId)
                throw new Error("Request could not be resolved after insert.");
            for (const tag of input.tags ?? []) {
                await this.connection.execute("INSERT IGNORE INTO request_tags (request_id, tag) VALUES (?, ?)", [requestId, tag]);
            }
            await this.connection.commit();
        }
        catch (error) {
            await this.connection.rollback();
            throw error;
        }
        const created = await this.get(publicId);
        if (!created)
            throw new Error("Created request could not be loaded.");
        return created;
    }
    async update(publicId, input) {
        const assignments = [];
        const values = [];
        if (input.status !== undefined) {
            assignments.push("status = ?");
            values.push(input.status);
        }
        if (input.priority !== undefined) {
            assignments.push("priority = ?");
            values.push(input.priority);
        }
        if (input.dueAt !== undefined) {
            assignments.push("due_at = ?");
            values.push(input.dueAt);
        }
        await this.connection.beginTransaction();
        try {
            if (input.assignee !== undefined) {
                if (input.assignee === null) {
                    assignments.push("assignee_id = NULL");
                }
                else {
                    const [agents] = await this.connection.execute("SELECT id FROM users WHERE display_name = ? AND role IN ('agent', 'administrator') LIMIT 1", [input.assignee]);
                    const assigneeId = agents[0]?.id;
                    if (!assigneeId)
                        throw new Error(`Unknown agent: ${input.assignee}`);
                    assignments.push("assignee_id = ?");
                    values.push(assigneeId);
                }
            }
            if (assignments.length) {
                await this.connection.execute(`UPDATE service_requests SET ${assignments.join(", ")}, updated_at = UTC_TIMESTAMP() WHERE public_id = ?`, [...values, publicId]);
            }
            if (input.tags !== undefined) {
                const [requests] = await this.connection.execute("SELECT id FROM service_requests WHERE public_id = ? LIMIT 1", [publicId]);
                const requestId = requests[0]?.id;
                if (!requestId) {
                    await this.connection.rollback();
                    return undefined;
                }
                await this.connection.execute("DELETE FROM request_tags WHERE request_id = ?", [requestId]);
                for (const tag of input.tags) {
                    await this.connection.execute("INSERT INTO request_tags (request_id, tag) VALUES (?, ?)", [requestId, tag]);
                }
            }
            await this.connection.commit();
        }
        catch (error) {
            await this.connection.rollback();
            throw error;
        }
        return this.get(publicId);
    }
}
//# sourceMappingURL=mysql-store.js.map