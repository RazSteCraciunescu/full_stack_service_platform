import { requestPriorities, requestStatuses } from "./types.js";
const terminal = new Set(["Resolved", "Closed"]);
export function calculateMetrics(items, referenceTime = new Date("2026-08-30T12:00:00.000Z")) {
    const byStatus = Object.fromEntries(requestStatuses.map((status) => [status, 0]));
    const byPriority = Object.fromEntries(requestPriorities.map((priority) => [priority, 0]));
    const categories = new Map();
    const ratings = [];
    let atRisk = 0;
    let unassigned = 0;
    for (const item of items) {
        byStatus[item.status] += 1;
        byPriority[item.priority] += 1;
        categories.set(item.category, (categories.get(item.category) ?? 0) + 1);
        if (!item.assignee && !terminal.has(item.status))
            unassigned += 1;
        if (item.satisfaction !== null)
            ratings.push(item.satisfaction);
        if (!terminal.has(item.status) && item.dueAt && Date.parse(item.dueAt) <= referenceTime.getTime())
            atRisk += 1;
    }
    const resolved = items.filter((item) => terminal.has(item.status)).length;
    const active = items.length - resolved;
    return {
        total: items.length,
        active,
        unassigned,
        resolved,
        atRisk,
        resolutionRate: items.length ? Math.round((resolved / items.length) * 1000) / 10 : 0,
        averageSatisfaction: ratings.length ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10 : null,
        byStatus,
        byPriority,
        byCategory: [...categories.entries()]
            .map(([category, count]) => ({ category, count }))
            .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category))
    };
}
//# sourceMappingURL=metrics.js.map