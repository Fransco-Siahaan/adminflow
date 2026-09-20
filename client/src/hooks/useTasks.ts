import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import type { Task, ApiResponse, Pagination } from '../types';

interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  deadlineFilter?: string;
  page?: number;
  limit?: number;
}

interface UseTasksReturn {
  tasks: Task[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTasks(filters: TaskFilters = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const stableFilters = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<
          ApiResponse<{ tasks: Task[]; pagination: Pagination }>
        >('/tasks', { params: filters });

        if (!cancelled) {
          setTasks(response.data.data.tasks);
          setPagination(response.data.data.pagination);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat tasks');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableFilters, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return { tasks, pagination, isLoading, error, refetch };
}