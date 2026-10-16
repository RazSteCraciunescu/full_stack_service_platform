import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import type { CreateRequestInput, RequestFilters, ServiceMetrics, ServiceRequest } from "../types";

export function usePortalData(filters: RequestFilters) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, nextMetrics] = await Promise.all([api.listRequests(filters), api.getMetrics()]);
      setRequests(items);
      setMetrics(nextMetrics);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The portal data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [filters.priority, filters.q, filters.status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function createRequest(input: CreateRequestInput) {
    const created = await api.createRequest(input);
    await reload();
    return created;
  }

  async function updateRequest(id: string, input: Parameters<typeof api.updateRequest>[1]) {
    const updated = await api.updateRequest(id, input);
    setRequests((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setMetrics(await api.getMetrics());
    return updated;
  }

  return { requests, metrics, loading, error, reload, createRequest, updateRequest };
}
