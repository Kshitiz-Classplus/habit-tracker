import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    completed: { type: Boolean, default: false },
    comment: { type: String, default: '' },
  },
  { _id: false }
);

const HabitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
    entries: { type: [EntrySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Habit', HabitSchema);
