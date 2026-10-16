import type { ServiceRequest } from "../types";

export function countActive(items: ServiceRequest[]): number {
  return items.filter((item) => !["Resolved", "Closed"].includes(item.status)).length;
}

export function groupByStatus(items: ServiceRequest[]): Record<string, number> {
  return items.reduce<Record<string, number>>((totals, item) => {
    totals[item.status] = (totals[item.status] ?? 0) + 1;
    return totals;
  }, {});
}
