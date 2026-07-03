import { Document } from 'mongoose';

export interface ICleaningLog {
  date: Date;
  completedBy: string;       // name of the staff who completed it
  notes?: string;
  photoUrl?: string;         // optional proof photo
  status: 'done' | 'edited';
}

export interface ICleaningTask extends Document {
  taskName: string;          // e.g. "Kitchen floor mop"
  area: string;              // e.g. "Kitchen", "Toilets"
  frequency: 'daily' | 'weekly' | 'perShift';
  // Optional repeat interval in days (1 = daily, 2 = every 2 days, 4 = every 4
  // days). When set, the task is "due" again N days after the last completion.
  // Null = schedule by `frequency` only.
  intervalDays?: number | null;
  userId: string;            // business owner's user id (same scoping as Fridge)
  logs: ICleaningLog[];
}
