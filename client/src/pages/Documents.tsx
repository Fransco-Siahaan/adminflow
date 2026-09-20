import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useAttachments } from '../hooks';
import { Skeleton, EmptyState, Button } from '../components/ui';
import DocumentCard from '../components/documents/DocumentCard';
import Pagination from '../components/tasks/Pagination';
import Select from '../components/ui/Select';

const MIME_FILTERS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'image/', label: 'Gambar' },
  { value: 'application/pdf', label: 'PDF' },
  { value: 'application/vnd.openxmlformats-officedocument', label: 'Office' },
];

export default function Documents() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [mimeType]);

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      mimeType: mimeType || undefined,
      page,
      limit: 24,
    }),
    [debouncedSearch, mimeType, page]
  );

  const { attachments, pagination, isLoading, error, refetch } =
    useAttachments(queryFilters);

  // GSAP animation
  useEffect(() => {
    if (!isLoading && attachments.length > 0 && listRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.doc-item', {
          y: 12,
          opacity: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
        });
      }, listRef);
      return () => ctx.revert();
    }
  }, [isLoading, attachments.length]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Dokumen</h1>
          <p className="text-sm text-surface-500 mt-1">
            Semua file yang diunggah ke task-task kamu.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="relative">
              <svg
                className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <Select
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            options={MIME_FILTERS}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="card">
          <EmptyState
            title="Gagal memuat dokumen"
            description={error}
            action={<Button onClick={refetch}>Coba lagi</Button>}
          />
        </div>
      ) : attachments.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title={
              search || mimeType
                ? 'Tidak ada dokumen yang cocok'
                : 'Belum ada dokumen'
            }
            description={
              search || mimeType
                ? 'Coba ubah filter atau kata kunci.'
                : 'Upload file di halaman detail task untuk memulai.'
            }
          />
        </div>
      ) : (
        <>
          <div
            ref={listRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {attachments.map((att) => (
              <div key={att._id} className="doc-item">
                <DocumentCard attachment={att} />
              </div>
            ))}
          </div>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}