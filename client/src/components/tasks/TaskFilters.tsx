import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../utils/constants';

export interface TaskFilterState {
  search: string;
  status: string;
  priority: string;
  deadlineFilter: string;
}

interface TaskFiltersProps {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
  onReset: () => void;
}

const DEADLINE_OPTIONS = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Hari ini' },
  { value: 'upcoming', label: 'Akan datang' },
  { value: 'completed', label: 'Selesai' },
];

export default function TaskFilters({
  filters,
  onChange,
  onReset,
}: TaskFiltersProps) {
  const update = (key: keyof TaskFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilter =
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.deadlineFilter;

  return (
    <div className="card p-4 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="lg:col-span-1">
          <Input
            placeholder="Cari task..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="!py-2"
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
          options={STATUS_OPTIONS}
          placeholder="Semua Status"
        />

        {/* Priority */}
        <Select
          value={filters.priority}
          onChange={(e) => update('priority', e.target.value)}
          options={PRIORITY_OPTIONS}
          placeholder="Semua Priority"
        />

        {/* Deadline */}
        <Select
          value={filters.deadlineFilter}
          onChange={(e) => update('deadlineFilter', e.target.value)}
          options={DEADLINE_OPTIONS}
          placeholder="Semua Deadline"
        />
      </div>

      {hasActiveFilter && (
        <div className="mt-3 pt-3 border-t border-surface-100 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            ✕ Reset filter
          </Button>
        </div>
      )}
    </div>
  );
}