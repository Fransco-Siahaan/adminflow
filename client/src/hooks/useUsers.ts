import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import type { User, ApiResponse } from '../types';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<ApiResponse<{ users: User[] }>>('/users');
        if (!cancelled) setUsers(res.data.data.users);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat users');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return {
    users,
    isLoading,
    error,
    refetch: useCallback(() => setRefreshKey((k) => k + 1), []),
  };
}