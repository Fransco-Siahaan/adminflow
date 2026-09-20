import { useState, useEffect, FormEvent } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { api, getErrorMessage } from '../../lib/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
];

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: EditUserModalProps) {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
      setErrors({});
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrors({});
    setIsLoading(true);

    try {
      await api.patch(`/users/${user._id}`, { name, role });
      toast.success('User berhasil diupdate');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const isSelf = currentUser?._id === user?._id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" form="edit-user-form" isLoading={isLoading}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs text-surface-500 mb-1">Email</p>
          <p className="text-sm font-medium text-surface-900">{user?.email}</p>
        </div>

        <Input
          label="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
          disabled={isSelf}
        />

        {isSelf && (
          <p className="text-xs text-warning">
            ⚠️ Kamu tidak bisa mengubah role diri sendiri.
          </p>
        )}
      </form>
    </Modal>
  );
}