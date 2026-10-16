from datetime import datetime, timezone
import unittest

from app.reporting import build_summary, priority_backlog


class ReportingTests(unittest.TestCase):
    def setUp(self):
        self.items = [
            {
                "id": "SR-1",
                "status": "Open",
                "priority": "Medium",
                "category": "Billing",
                "assignee": None,
                "dueAt": "2026-01-01T00:00:00Z",
                "createdAt": "2026-01-01T00:00:00Z",
                "satisfaction": None,
            },
            {
                "id": "SR-2",
                "status": "Resolved",
                "priority": "Low",
                "category": "Billing",
                "assignee": "Sam",
                "dueAt": None,
                "createdAt": "2026-01-02T00:00:00Z",
                "satisfaction": 4,
            },
            {
                "id": "SR-3",
                "status": "In Progress",
                "priority": "Urgent",
                "category": "Account",
                "assignee": "Jo",
                "dueAt": "2027-01-01T00:00:00Z",
                "createdAt": "2026-01-03T00:00:00Z",
                "satisfaction": None,
            },
        ]

    def test_summary_counts_active_and_overdue_requests(self):
        result = build_summary(self.items, datetime(2026, 8, 30, tzinfo=timezone.utc))
        self.assertEqual(result["total"], 3)
        self.assertEqual(result["active"], 2)
        self.assertEqual(result["overdue"], 1)
        self.assertEqual(result["resolutionRate"], 33.3)

    def test_priority_backlog_places_urgent_first(self):
        result = priority_backlog(self.items)
        self.assertEqual([item["id"] for item in result], ["SR-3", "SR-1"])


if __name__ == "__main__":
    unittest.main()
