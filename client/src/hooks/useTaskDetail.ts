import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import type { TaskDetail, ApiResponse } from '../types';

interface UseTaskDetailReturn {
  data: TaskDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTaskDetail(taskId: string | undefined): UseTaskDetailReturn {
  const [data, setData] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!taskId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDetail() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<TaskDetail>>(`/tasks/${taskId}`);
        if (!cancelled) setData(res.data.data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat detail task');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [taskId, refreshKey]);

  return {
    data,
    isLoading,
    error,
    refetch: useCallback(() => setRefreshKey((k) => k + 1), []),
  };
}