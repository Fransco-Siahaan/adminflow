import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Skeleton, EmptyState, Badge } from '../components/ui';
import Button from '../components/ui/Button';
import { formatDate, getInitials } from '../utils/format';

export default function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { profile, taskStats, isLoading, error, refetch } = useProfile();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && profile && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.profile-section', {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [isLoading, profile]);

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <EmptyState
        title="Gagal memuat profil"
        description={error || 'Silakan coba lagi.'}
        action={<Button onClick={refetch}>Coba lagi</Button>}
      />
    );
  }

  return (
    <div ref={pageRef} className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="profile-section">
        <h1 className="text-2xl font-bold text-surface-900">Profile</h1>
        <p className="text-sm text-surface-500 mt-1">
          Info akun & statistik task kamu.
        </p>
      </div>

      {/* Profile Card */}
      <div className="profile-section card p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0 shadow-lg shadow-primary-600/20">
            {getInitials(profile.name)}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-surface-900 truncate">
              {profile.name}
            </h2>
            <p className="text-sm text-surface-500 truncate mt-1">
              {profile.email}
            </p>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge color={profile.role === 'manager' ? 'purple' : 'green'}>
                {profile.role === 'manager' ? '👔 Manager' : '🧑‍💼 Staff'}
              </Badge>
              <span className="text-xs text-surface-400">
                Bergabung {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="flex-1 md:flex-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="profile-section">
        <h2 className="text-lg font-semibold text-surface-900 mb-3">
          Statistik Task
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="Total Di-assign"
            value={taskStats?.assignedTotal ?? 0}
            color="primary"
          />
          <StatBox
            label="In Progress"
            value={taskStats?.assignedInProgress ?? 0}
            color="info"
          />
          <StatBox
            label="Selesai"
            value={taskStats?.assignedCompleted ?? 0}
            color="success"
          />
          <StatBox
            label="Terlambat"
            value={taskStats?.assignedOverdue ?? 0}
            color="danger"
          />
        </div>
      </div>

      {/* Account Info */}
      <div className="profile-section card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">
          Informasi Akun
        </h2>

        <dl className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 border-b border-surface-100 pb-3">
            <dt className="text-sm text-surface-500">Nama Lengkap</dt>
            <dd className="text-sm font-medium text-surface-900">
              {profile.name}
            </dd>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 border-b border-surface-100 pb-3">
            <dt className="text-sm text-surface-500">Email</dt>
            <dd className="text-sm font-medium text-surface-900">
              {profile.email}
            </dd>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 border-b border-surface-100 pb-3">
            <dt className="text-sm text-surface-500">Role</dt>
            <dd className="text-sm font-medium text-surface-900 capitalize">
              {profile.role}
            </dd>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
            <dt className="text-sm text-surface-500">Bergabung Sejak</dt>
            <dd className="text-sm font-medium text-surface-900">
              {formatDate(profile.createdAt)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 p-4 rounded-lg bg-surface-50 border border-surface-200">
          <p className="text-xs text-surface-500">
            💡 <span className="font-medium text-surface-700">Info:</span>{' '}
            Untuk update profil (nama, email, password), hubungi manager kamu.
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== Helper Component =====
function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'primary' | 'info' | 'success' | 'danger';
}) {
  const colors = {
    primary: 'text-primary-600',
    info: 'text-blue-600',
    success: 'text-emerald-600',
    danger: 'text-red-600',
  }[color];

  return (
    <div className="card p-4">
      <p className="text-xs text-surface-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors}`}>{value}</p>
    </div>
  );
}