import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import type { Activity, ApiResponse, Pagination } from '../types';

interface ActivityFilters {
  page?: number;
  limit?: number;
}

interface UseActivitiesReturn {
  activities: Activity[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActivities(
  filters: ActivityFilters = {}
): UseActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const stableFilters = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<
          ApiResponse<{ activities: Activity[]; pagination: Pagination }>
        >('/activities', { params: filters });

        if (!cancelled) {
          setActivities(res.data.data.activities);
          setPagination(res.data.data.pagination);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat aktivitas');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableFilters, refreshKey]);

  return {
    activities,
    pagination,
    isLoading,
    error,
    refetch: useCallback(() => setRefreshKey((k) => k + 1), []),
  };
}