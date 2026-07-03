import { Schema, model } from 'mongoose';
import { ICleaningTask } from './cleaning.interface';

const CleaningLogSchema = new Schema(
  {
    date: { type: Date, required: true },
    completedBy: { type: String, required: true },
    notes: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    status: { type: String, enum: ['done', 'edited'], default: 'done' },
  },
  { _id: true } // each log gets its own id (mirrors FridgeRecord)
);

const CleaningTaskSchema = new Schema<ICleaningTask>({
  taskName: { type: String, required: true },
  area: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'perShift'], default: 'daily' },
  // Repeat every N days (auto-regenerates the task). Null = use frequency only.
  intervalDays: { type: Number, default: null },
  userId: { type: String, required: true, ref: 'User', index: true },
  logs: [CleaningLogSchema],
});

const CleaningTask = model<ICleaningTask>('CleaningTask', CleaningTaskSchema);
export default CleaningTask;
