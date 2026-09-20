import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import type { DashboardData, ApiResponse } from '../types';

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ApiResponse<DashboardData>>('/dashboard');
        if (!cancelled) {
          setData(response.data.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat dashboard');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return {
    data,
    isLoading,
    error,
    refetch: () => setRefreshKey((k) => k + 1),
  };
}