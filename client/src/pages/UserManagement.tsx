import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useUsers } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, getErrorMessage } from '../lib/axios';
import Button from '../components/ui/Button';
import { Skeleton, EmptyState, Badge } from '../components/ui';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EditUserModal from '../components/users/EditUserModal';
import { formatDate, getInitials } from '../utils/format';
import type { User } from '../types';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { users, isLoading, error, refetch } = useUsers();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && users.length > 0 && listRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.user-row', {
          y: 8,
          opacity: 0,
          duration: 0.3,
          stagger: 0.04,
          ease: 'power2.out',
        });
      }, listRef);
      return () => ctx.revert();
    }
  }, [isLoading, users.length]);

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteUser._id}`);
      toast.success('User dihapus');
      setDeleteUser(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <EmptyState
          title="Gagal memuat users"
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
        <h1 className="text-2xl font-bold text-surface-900">Manajemen User</h1>
        <p className="text-sm text-surface-500 mt-1">
          Kelola user dan role mereka.
        </p>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs text-surface-500">Total Users</p>
          <p className="text-2xl font-bold text-surface-900 mt-1">
            {users.length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-surface-500">Managers</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            {users.filter((u) => u.role === 'manager').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-surface-500">Staff</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {users.filter((u) => u.role === 'staff').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div ref={listRef} className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wide hidden md:table-cell">
                  Role
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wide hidden lg:table-cell">
                  Bergabung
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-surface-600 uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map((user) => {
                const isSelf = user._id === currentUser?._id;
                return (
                  <tr
                    key={user._id}
                    className="user-row hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 flex items-center gap-1.5">
                            {user.name}
                            {isSelf && (
                              <span className="text-xs text-primary-600 font-normal">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-surface-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <Badge
                        color={user.role === 'manager' ? 'purple' : 'green'}
                      >
                        {user.role === 'manager' ? '👔 Manager' : '🧑‍💼 Staff'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-surface-500 hidden lg:table-cell">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          aria-label="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteUser(user)}
                          disabled={isSelf}
                          className="p-2 rounded-lg text-surface-400 hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-surface-400 disabled:hover:bg-transparent"
                          aria-label="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSuccess={refetch}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Hapus User"
        message={`Yakin ingin menghapus user "${deleteUser?.name}"? Tindakan ini tidak bisa dibatalkan.`}
        confirmText="Hapus"
        isLoading={isDeleting}
      />
    </div>
  );
}