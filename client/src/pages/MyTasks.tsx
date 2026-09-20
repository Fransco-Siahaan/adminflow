import { useState, useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { useTasks } from '../hooks';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Skeleton, EmptyState } from '../components/ui';
import { TaskGridItem } from '../components/tasks/TaskListView';
import { formatDate, getDeadlineStatus } from '../utils/format';
import type { Task, TaskStatus } from '../types';

const TABS: { key: TaskStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'completed', label: 'Completed' },
];

export default function MyTasks() {
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch all tasks — backend otomatis filter by assignedTo (staff role)
  const { tasks, isLoading, error, refetch } = useTasks({ limit: 100 });

  // Group stats
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      all: tasks.length,
      pending: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
    };
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return tasks;
    return tasks.filter((t) => t.status === activeTab);
  }, [tasks, activeTab]);

  // Today & Upcoming
  const todayTasks = useMemo(() => {
    const today = new Date();
    return tasks.filter((t) => {
      if (t.status === 'completed') return false;
      const d = new Date(t.deadline);
      const status = getDeadlineStatus(t.deadline, t.status);
      return status === 'today';
    });
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter((t) => {
        if (t.status === 'completed') return false;
        const d = new Date(t.deadline);
        return d > now && getDeadlineStatus(t.deadline, t.status) === 'soon';
      })
      .slice(0, 5);
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'completed') return false;
      return new Date(t.deadline) < new Date();
    });
  }, [tasks]);

  // GSAP animation
  useEffect(() => {
    if (!isLoading && listRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.my-task-item', {
          y: 12,
          opacity: 0,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
        });
      }, listRef);
      return () => ctx.revert();
    }
  }, [isLoading, filteredTasks.length, activeTab]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <EmptyState
          title="Gagal memuat task"
          description={error}
          action={<Button onClick={refetch}>Coba lagi</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">My Tasks</h1>
        <p className="text-sm text-surface-500 mt-1">
          Fokus ke task yang diberikan ke kamu.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatMini
          label="Pending"
          value={stats.pending}
          color="bg-surface-100 text-surface-700"
        />
        <StatMini
          label="In Progress"
          value={stats.in_progress}
          color="bg-blue-100 text-blue-700"
        />
        <StatMini
          label="Review"
          value={stats.review}
          color="bg-amber-100 text-amber-700"
        />
        <StatMini
          label="Completed"
          value={stats.completed}
          color="bg-emerald-100 text-emerald-700"
        />
      </div>

      {/* Attention sections */}
      {overdueTasks.length > 0 && (
        <AttentionSection
          title="⚠️ Terlambat"
          count={overdueTasks.length}
          tasks={overdueTasks}
          color="danger"
        />
      )}

      {todayTasks.length > 0 && (
        <AttentionSection
          title="📅 Deadline Hari Ini"
          count={todayTasks.length}
          tasks={todayTasks}
          color="warning"
        />
      )}

      {upcomingTasks.length > 0 && (
        <AttentionSection
          title="⏳ Akan Datang (3 hari ke depan)"
          count={upcomingTasks.length}
          tasks={upcomingTasks}
          color="info"
        />
      )}

      {/* Tabs */}
      <div className="border-b border-surface-200 overflow-x-auto scrollbar-thin">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = stats[tab.key] ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-surface-100 text-surface-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task list */}
      <div ref={listRef}>
        {filteredTasks.length === 0 ? (
          <div className="card">
            <EmptyState
              title={
                activeTab === 'all'
                  ? 'Belum ada task'
                  : `Tidak ada task di "${TABS.find((t) => t.key === activeTab)?.label}"`
              }
              description={
                activeTab === 'all'
                  ? 'Belum ada task yang diberikan ke kamu.'
                  : 'Coba pilih tab lain.'
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <div key={task._id} className="my-task-item">
                <TaskGridItem task={task} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Helper Components =====

function StatMini({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center font-bold text-sm`}
      >
        {value}
      </div>
      <div>
        <p className="text-xs text-surface-500">{label}</p>
        <p className="text-sm font-semibold text-surface-900">
          {value} task
        </p>
      </div>
    </div>
  );
}

function AttentionSection({
  title,
  count,
  tasks,
  color,
}: {
  title: string;
  count: number;
  tasks: Task[];
  color: 'danger' | 'warning' | 'info';
}) {
  const colors = {
    danger: 'border-red-200 bg-red-50/50',
    warning: 'border-amber-200 bg-amber-50/50',
    info: 'border-blue-200 bg-blue-50/50',
  }[color];

  return (
    <div className={`rounded-xl border ${colors} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-800">{title}</h3>
        <span className="text-xs text-surface-500">{count} task</span>
      </div>
      <div className="space-y-2">
        {tasks.slice(0, 3).map((task) => (
          <Link
            key={task._id}
            to={`/tasks/${task._id}`}
            className="block bg-white rounded-lg border border-surface-200 p-3 hover:border-primary-300 hover:shadow-card transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-surface-900 truncate flex-1">
                {task.title}
              </p>
              <span className="text-xs text-surface-500 whitespace-nowrap">
                {formatDate(task.deadline)}
              </span>
            </div>
          </Link>
        ))}
        {count > 3 && (
          <p className="text-xs text-surface-500 text-center pt-1">
            +{count - 3} task lainnya
          </p>
        )}
      </div>
    </div>
  );
}