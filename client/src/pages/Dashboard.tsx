import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useDashboard } from '../hooks';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import TaskCard from '../components/dashboard/TaskCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import { Skeleton, EmptyState } from '../components/ui';
import Button from '../components/ui/Button';

// Icon set
const Icons = {
  Total: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Progress: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Review: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Completed: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Overdue: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useDashboard();
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP staggered animation
  useEffect(() => {
    if (!isLoading && data && statsRef.current && contentRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.stat-card', {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
        });

        gsap.from('.dashboard-section', {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: 'power2.out',
        });
      }, contentRef);

      return () => ctx.revert();
    }
  }, [isLoading, data]);

  const isManager = user?.role === 'manager';

  // ===== Loading State =====
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ===== Error State =====
  if (error) {
    return (
      <EmptyState
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        title="Gagal memuat dashboard"
        description={error}
        action={<Button onClick={refetch}>Coba lagi</Button>}
      />
    );
  }

  if (!data) return null;

  const { stats, recentTasks, recentActivities } = data;

  return (
    <div ref={contentRef} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Halo, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          {isManager
            ? 'Berikut ringkasan aktivitas tim kamu hari ini.'
            : 'Berikut ringkasan task kamu hari ini.'}
        </p>
      </div>

      {/* Stat Cards */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <div className="stat-card">
          <StatCard
            label="Total Tasks"
            value={stats.totalTasks}
            icon={<Icons.Total />}
            variant="primary"
          />
        </div>
        <div className="stat-card">
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Icons.Progress />}
            variant="info"
          />
        </div>
        <div className="stat-card">
          <StatCard
            label="Review"
            value={stats.review}
            icon={<Icons.Review />}
            variant="warning"
          />
        </div>
        <div className="stat-card">
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<Icons.Completed />}
            variant="success"
          />
        </div>
        <div className="stat-card">
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={<Icons.Overdue />}
            variant="danger"
          />
        </div>
      </div>

      {/* Manager-only: total users */}
      {isManager && stats.totalUsers > 0 && (
        <div className="dashboard-section card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Icons.Users />
            </div>
            <div>
              <p className="text-sm text-surface-500">Total Users</p>
              <p className="text-lg font-semibold text-surface-900">
                {stats.totalUsers} user terdaftar
              </p>
            </div>
          </div>
          <Link to="/users">
            <Button variant="secondary" size="sm">
              Kelola
            </Button>
          </Link>
        </div>
      )}

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Tasks */}
        <div className="lg:col-span-2 dashboard-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">
              {isManager ? 'Task Terbaru' : 'Task Saya Terbaru'}
            </h2>
            <Link
              to="/tasks"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Lihat semua →
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Icons.Total />}
                title="Belum ada task"
                description={
                  isManager
                    ? 'Buat task pertama kamu untuk memulai.'
                    : 'Belum ada task yang diberikan ke kamu.'
                }
                action={
                  isManager ? (
                    <Link to="/tasks">
                      <Button>Buat task</Button>
                    </Link>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Activity */}
        <div className="dashboard-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">
              Aktivitas Terbaru
            </h2>
            <Link
              to="/activities"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="card divide-y divide-surface-100 max-h-[600px] overflow-y-auto scrollbar-thin">
            {recentActivities.length === 0 ? (
              <EmptyState
                icon={<Icons.Progress />}
                title="Belum ada aktivitas"
                description="Aktivitas akan muncul di sini."
              />
            ) : (
              <div className="px-4">
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity._id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}