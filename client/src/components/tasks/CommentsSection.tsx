import { useState, FormEvent, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { api, getErrorMessage } from '../../lib/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatRelative, getInitials } from '../../utils/format';
import type { Comment } from '../../types';

interface CommentsSectionProps {
  taskId: string;
  comments: Comment[];
  onRefetch: () => void;
}

export default function CommentsSection({
  taskId,
  comments,
  onRefetch,
}: CommentsSectionProps) {
  const toast = useToast();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comments.length > 0 && listRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.comment-item', {
          y: 12,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.out',
        });
      }, listRef);
      return () => ctx.revert();
    }
  }, [comments.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      await api.post(`/tasks/${taskId}/comments`, { comment: text.trim() });
      setText('');
      toast.success('Komentar ditambahkan');
      onRefetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/comments/${deleteId}`);
      toast.success('Komentar dihapus');
      setDeleteId(null);
      onRefetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide mb-3">
        Komentar ({comments.length})
      </h3>

      {/* Form input */}
      <form onSubmit={handleSubmit} className="mb-5">
        <Textarea
          placeholder="Tulis komentar..."
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-surface-400">
            {text.length}/2000
          </span>
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            disabled={!text.trim()}
          >
            Kirim
          </Button>
        </div>
      </form>

      {/* List */}
      <div ref={listRef} className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-4">
            Belum ada komentar.
          </p>
        ) : (
          comments.map((comment) => {
            const isOwner = comment.userId._id === user?._id;
            const canDelete = isOwner || user?.role === 'manager';

            return (
              <div
                key={comment._id}
                className="comment-item flex gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold flex-shrink-0">
                  {getInitials(comment.userId.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium text-surface-900">
                      {comment.userId.name}
                    </span>
                    <span className="text-xs text-surface-400">
                      {formatRelative(comment.createdAt)}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => setDeleteId(comment._id)}
                        className="text-xs text-danger opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-surface-700 mt-0.5 whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Komentar"
        message="Yakin ingin menghapus komentar ini? Tindakan ini tidak bisa dibatalkan."
        confirmText="Hapus"
        isLoading={isDeleting}
      />
    </div>
  );
}