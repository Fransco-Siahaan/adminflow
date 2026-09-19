import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      required: [true, 'Komentar wajib diisi'],
      trim: true,
      minlength: [1, 'Komentar tidak boleh kosong'],
      maxlength: [2000, 'Komentar maksimal 2000 karakter'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Comment: Model<IComment> = mongoose.model<IComment>(
  'Comment',
  commentSchema
);