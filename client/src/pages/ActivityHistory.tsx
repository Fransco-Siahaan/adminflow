import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useActivities } from '../hooks';
import { Skeleton, EmptyState, Button } from '../components/ui';
import ActivityRow from '../components/activities/ActivityRow';
import Pagination from '../components/tasks/Pagination';

export default function ActivityHistory() {
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const { activities, pagination, isLoading, error, refetch } = useActivities({
    page,
    limit: 20,
  });

  useEffect(() => {
    if (!isLoading && activities.length > 0 && listRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.activity-row', {
          x: -8,
          opacity: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: 'power2.out',
        });
      }, listRef);
      return () => ctx.revert();
    }
  }, [isLoading, activities.length]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Riwayat Aktivitas
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Semua aktivitas yang terjadi di task-task kamu.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="card divide-y divide-surface-100">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card">
          <EmptyState
            title="Gagal memuat aktivitas"
            description={error}
            action={<Button onClick={refetch}>Coba lagi</Button>}
          />
        </div>
      ) : activities.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            title="Belum ada aktivitas"
            description="Aktivitas akan muncul di sini setelah kamu mulai bekerja dengan task."
          />
        </div>
      ) : (
        <>
          <div
            ref={listRef}
            className="card divide-y divide-surface-100 overflow-hidden"
          >
            {activities.map((activity) => (
              <div key={activity._id} className="activity-row">
                <ActivityRow activity={activity} />
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