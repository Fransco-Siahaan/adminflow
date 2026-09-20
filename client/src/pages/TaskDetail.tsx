import { useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useTaskDetail } from '../hooks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { Skeleton, EmptyState, PriorityBadge, StatusBadge } from '../components/ui';
import StatusUpdateButtons from '../components/tasks/StatusUpdateButtons';
import CommentsSection from '../components/tasks/CommentsSection';
import AttachmentsSection from '../components/tasks/AttachmentsSection';
import ActivityTimeline from '../components/tasks/ActivityTimeline';
import { formatDateTime, getDeadlineStatus } from '../utils/format';
import { api, getErrorMessage } from '../lib/axios';
import { useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isManager } = useAuth();
  const toast = useToast();
  const { data, isLoading, error, refetch } = useTaskDetail(id);
  const pageRef = useRef<HTMLDivElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && data && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.detail-section', {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [isLoading, data]);

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task dihapus');
      navigate('/tasks');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Task tidak ditemukan"
        description={error || 'Task ini mungkin sudah dihapus.'}
        action={
          <Link to="/tasks">
            <Button>Kembali ke Tasks</Button>
          </Link>
        }
      />
    );
  }

  const { task, comments, attachments, activities } = data;
  const deadlineStatus = getDeadlineStatus(task.deadline, task.status);

  const deadlineColor = {
    overdue: 'text-danger',
    today: 'text-warning',
    soon: 'text-warning',
    normal: 'text-surface-600',
    completed: 'text-surface-400',
  }[deadlineStatus];

  const deadlineLabel = {
    overdue: 'Terlambat',
    today: 'Hari ini',
    soon: 'Segera',
    normal: 'Deadline',
    completed: 'Selesai',
  }[deadlineStatus];

  return (
    <div ref={pageRef} className="space-y-5">
      {/* Breadcrumb + Actions */}
      <div className="detail-section flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <Link
            to="/tasks"
            className="text-surface-500 hover:text-surface-700"
          >
            Tasks
          </Link>
          <span className="text-surface-300">/</span>
          <span className="text-surface-700 font-medium truncate max-w-[200px] md:max-w-md">
            {task.title}
          </span>
        </div>

        {isManager && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-danger hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </Button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-5">
          {/* Task Header */}
          <div className="detail-section card p-6">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.isOverdue && (
                <span className="badge bg-red-100 text-red-700">⚠️ Overdue</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-surface-900 mb-3">
              {task.title}
            </h1>

            <p className="text-surface-600 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Status Update */}
          <div className="detail-section card p-5">
            <StatusUpdateButtons task={task} onSuccess={refetch} />
          </div>

          {/* Comments */}
          <div className="detail-section card p-5">
            <CommentsSection
              taskId={task._id}
              comments={comments}
              onRefetch={refetch}
            />
          </div>

          {/* Attachments */}
          <div className="detail-section card p-5">
            <AttachmentsSection
              taskId={task._id}
              attachments={attachments}
              onRefetch={refetch}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Meta */}
          <div className="detail-section card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">
              Detail
            </h3>

            <div>
              <p className="text-xs text-surface-500 mb-1">Penanggung Jawab</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
                  {task.assignedTo?.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {task.assignedTo?.name}
                  </p>
                  <p className="text-xs text-surface-500 truncate">
                    {task.assignedTo?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-surface-100 pt-4">
              <p className="text-xs text-surface-500 mb-1">Dibuat oleh</p>
              <p className="text-sm font-medium text-surface-900">
                {task.createdBy?.name}
              </p>
            </div>

            <div className="border-t border-surface-100 pt-4">
              <p className="text-xs text-surface-500 mb-1">{deadlineLabel}</p>
              <p className={`text-sm font-medium ${deadlineColor}`}>
                {formatDateTime(task.deadline)}
              </p>
            </div>

            <div className="border-t border-surface-100 pt-4">
              <p className="text-xs text-surface-500 mb-1">Dibuat</p>
              <p className="text-sm text-surface-700">
                {formatDateTime(task.createdAt)}
              </p>
            </div>

            <div className="border-t border-surface-100 pt-4">
              <p className="text-xs text-surface-500 mb-1">Terakhir diupdate</p>
              <p className="text-sm text-surface-700">
                {formatDateTime(task.updatedAt)}
              </p>
            </div>
          </div>

          {/* Activity */}
          <div className="detail-section card p-5">
            <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide mb-4">
              Riwayat Aktivitas
            </h3>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Task"
        message="Yakin ingin menghapus task ini? Semua komentar dan dokumen terkait akan dihapus permanen."
        confirmText="Hapus Task"
        isLoading={isDeleting}
      />
    </div>
  );
}