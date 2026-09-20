import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';
import type { Attachment, ApiResponse, Pagination } from '../types';

interface AttachmentFilters {
  search?: string;
  mimeType?: string;
  page?: number;
  limit?: number;
}

interface UseAttachmentsReturn {
  attachments: Attachment[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAttachments(
  filters: AttachmentFilters = {}
): UseAttachmentsReturn {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
          ApiResponse<{ attachments: Attachment[]; pagination: Pagination }>
        >('/attachments', { params: filters });

        if (!cancelled) {
          setAttachments(res.data.data.attachments);
          setPagination(res.data.data.pagination);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Gagal memuat dokumen');
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
    attachments,
    pagination,
    isLoading,
    error,
    refetch: useCallback(() => setRefreshKey((k) => k + 1), []),
  };
}