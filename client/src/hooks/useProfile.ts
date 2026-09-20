import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import type { User, ApiResponse } from '../types';

interface TaskStats {
  assignedTotal: number;
  assignedCompleted: number;
  assignedInProgress: number;
  assignedOverdue: number;
}

interface UseProfileReturn {
  profile: User | null;
  taskStats: TaskStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?._id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<
          ApiResponse<{ user: User; taskStats: TaskStats }>
        >(`/users/${user!._id}`);

        if (!cancelled) {
          setProfile(res.data.data.user);
          setTaskStats(res.data.data.taskStats);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat profil');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user?._id, refreshKey]);

  return {
    profile,
    taskStats,
    isLoading,
    error,
    refetch: useCallback(() => setRefreshKey((k) => k + 1), []),
  };
}