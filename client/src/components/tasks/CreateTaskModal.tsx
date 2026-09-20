import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { api, getErrorMessage, getFieldErrors } from '../../lib/axios';
import { useToast } from '../../context/ToastContext';
import { PRIORITY_OPTIONS } from '../../utils/constants';
import type { User, ApiResponse } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    assignedTo: '',
  });

  // Fetch staff saat modal buka
  useEffect(() => {
    if (!isOpen) return;

    async function fetchStaff() {
      try {
        const res = await api.get<ApiResponse<{ users: User[] }>>('/users');
        const staff = res.data.data.users.filter((u) => u.role === 'staff');
        setStaffList(staff);
      } catch (error) {
        toast.error('Gagal memuat daftar staff');
      }
    }
    fetchStaff();
  }, [isOpen, toast]);

  // Reset form saat modal close
  useEffect(() => {
    if (!isOpen) {
      setForm({
        title: '',
        description: '',
        priority: 'medium',
        deadline: '',
        assignedTo: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await api.post('/tasks', form);
      toast.success('Task berhasil dibuat');
      onSuccess();
      onClose();
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (fieldErrors) {
        const flattened: Record<string, string> = {};
        Object.entries(fieldErrors).forEach(([key, msgs]) => {
          flattened[key] = msgs[0];
        });
        setErrors(flattened);
      }
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Min deadline: hari ini
  const minDeadline = new Date().toISOString().slice(0, 16);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Task Baru"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" form="create-task-form" isLoading={isLoading}>
            Buat Task
          </Button>
        </>
      }
    >
      <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Judul Task"
          name="title"
          placeholder="Contoh: Input Data Klien Baru"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Deskripsi"
          name="description"
          placeholder="Jelaskan detail task..."
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          error={errors.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Priority"
            name="priority"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={PRIORITY_OPTIONS}
            error={errors.priority}
          />

          <Input
            label="Deadline"
            name="deadline"
            type="datetime-local"
            min={minDeadline}
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            error={errors.deadline}
          />
        </div>

        <Select
          label="Assign ke Staff"
          name="assignedTo"
          value={form.assignedTo}
          onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          options={staffList.map((s) => ({ value: s._id, label: s.name }))}
          placeholder="Pilih staff..."
          error={errors.assignedTo}
        />

        {staffList.length === 0 && (
          <p className="text-xs text-warning">
            ⚠️ Belum ada staff terdaftar. Daftarkan staff dulu di menu Users.
          </p>
        )}
      </form>
    </Modal>
  );
}