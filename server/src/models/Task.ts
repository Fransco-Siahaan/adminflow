import mongoose, { Schema, Document, Model } from 'mongoose';
import { TaskPriority, TaskStatus } from '../types';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: Date;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Judul task wajib diisi'],
      trim: true,
      minlength: [3, 'Judul minimal 3 karakter'],
      maxlength: [200, 'Judul maksimal 200 karakter'],
    },
    description: {
      type: String,
      required: [true, 'Deskripsi wajib diisi'],
      trim: true,
      maxlength: [5000, 'Deskripsi maksimal 5000 karakter'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'review', 'completed', 'needs_revision'],
      default: 'pending',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline wajib diisi'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: cek overdue
taskSchema.virtual('isOverdue').get(function (this: ITask) {
  return this.status !== 'completed' && new Date() > this.deadline;
});

// Index untuk query yang sering dipakai
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ deadline: 1 });

export const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);