from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from typing import Any, Iterable

TERMINAL_STATUSES = {"Resolved", "Closed"}


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def build_summary(requests: Iterable[dict[str, Any]], now: datetime | None = None) -> dict[str, Any]:
    items = list(requests)
    reference = now or datetime.now(timezone.utc)
    status_counts = Counter(str(item.get("status", "Unknown")) for item in items)
    priority_counts = Counter(str(item.get("priority", "Unknown")) for item in items)
    category_counts = Counter(str(item.get("category", "Unknown")) for item in items)

    active = [item for item in items if item.get("status") not in TERMINAL_STATUSES]
    overdue = [
        item
        for item in active
        if (due := _parse_date(item.get("dueAt"))) is not None and due <= reference
    ]
    ratings = [float(item["satisfaction"]) for item in items if item.get("satisfaction") is not None]

    return {
        "generatedAt": reference.isoformat(),
        "total": len(items),
        "active": len(active),
        "resolved": len(items) - len(active),
        "unassigned": sum(1 for item in active if not item.get("assignee")),
        "overdue": len(overdue),
        "resolutionRate": round(((len(items) - len(active)) / len(items)) * 100, 1) if items else 0.0,
        "averageSatisfaction": round(sum(ratings) / len(ratings), 1) if ratings else None,
        "byStatus": dict(sorted(status_counts.items())),
        "byPriority": dict(sorted(priority_counts.items())),
        "byCategory": [
            {"category": name, "count": count}
            for name, count in sorted(category_counts.items(), key=lambda pair: (-pair[1], pair[0]))
        ],
    }


def priority_backlog(requests: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    order = {"Urgent": 0, "High": 1, "Medium": 2, "Low": 3}
    active = [item for item in requests if item.get("status") not in TERMINAL_STATUSES]
    return sorted(
        active,
        key=lambda item: (order.get(str(item.get("priority")), 9), str(item.get("createdAt", ""))),
    )
