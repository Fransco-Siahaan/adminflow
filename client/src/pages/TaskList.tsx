import { useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks';
import Button from '../components/ui/Button';
import { Skeleton, EmptyState } from '../components/ui';
import TaskFilters from '../components/tasks/TaskFilters';
import type { TaskFilterState } from '../components/tasks/TaskFilters';
import { TaskGridItem, TaskListItem } from '../components/tasks/TaskListView';
import Pagination from '../components/tasks/Pagination';
import CreateTaskModal from '../components/tasks/CreateTaskModal';

const defaultFilters: TaskFilterState = {
  search: '',
  status: '',
  priority: '',
  deadlineFilter: '',
};

export default function TaskList() {
  const { isManager } = useAuth();
  const [filters, setFilters] = useState<TaskFilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Reset page saat filter lain berubah
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.priority, filters.deadlineFilter]);

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      deadlineFilter: filters.deadlineFilter || undefined,
      page,
      limit: 12,
    }),
    [debouncedSearch, filters.status, filters.priority, filters.deadlineFilter, page]
  );

  const { tasks, pagination, isLoading, error, refetch } = useTasks(queryFilters);

  // GSAP animation
  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from('.task-item', {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: 'power2.out',
        });
      });

      return () => ctx.revert();
    }
  }, [isLoading, tasks.length, view]);

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Tasks</h1>
          <p className="text-sm text-surface-500 mt-1">
            {isManager
              ? 'Kelola semua task tim kamu.'
              : 'Task yang diberikan ke kamu.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden md:flex items-center bg-surface-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-md transition-colors ${
                view === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors ${
                view === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              aria-label="List view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {isManager && (
            <Button onClick={() => setIsModalOpen(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Content */}
      {isLoading ? (
        <div
          className={`grid gap-4 ${
            view === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="card">
          <EmptyState
            title="Gagal memuat tasks"
            description={error}
            action={<Button onClick={refetch}>Coba lagi</Button>}
          />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title={filters.search || filters.status || filters.priority || filters.deadlineFilter ? 'Tidak ada task yang cocok' : 'Belum ada task'}
            description={
              filters.search || filters.status || filters.priority || filters.deadlineFilter
                ? 'Coba ubah filter kamu.'
                : isManager
                ? 'Buat task pertama kamu untuk memulai.'
                : 'Belum ada task yang diberikan ke kamu.'
            }
            action={
              isManager && !filters.search && !filters.status && !filters.priority && !filters.deadlineFilter ? (
                <Button onClick={() => setIsModalOpen(true)}>Buat task pertama</Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div
            className={`grid gap-4 ${
              view === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {tasks.map((task) => (
              <div key={task._id} className="task-item">
                {view === 'grid' ? (
                  <TaskGridItem task={task} />
                ) : (
                  <TaskListItem task={task} />
                )}
              </div>
            ))}
          </div>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}