import CleaningTask from './cleaning.model';
import { ICleaningTask } from './cleaning.interface';

class CleaningService {
  // Create a new cleaning task for the user/business
  public async createTask(
    userId: string,
    taskName: string,
    area: string,
    frequency: ICleaningTask['frequency'] = 'daily',
    intervalDays: number | null = null
  ): Promise<ICleaningTask> {
    const task = new CleaningTask({ userId, taskName, area, frequency, intervalDays, logs: [] });
    return task.save();
  }

  // Staff checks a task off → append a completion log
  public async addLog(
    taskId: string,
    completedBy: string,
    notes?: string,
    photoUrl?: string,
    date?: string
  ): Promise<ICleaningTask> {
    const task = await CleaningTask.findById(taskId);
    if (!task) throw new Error('Cleaning task not found');

    const logDate = date ? new Date(date) : new Date();
    if (Number.isNaN(logDate.getTime())) throw new Error('Invalid date');

    task.logs.push({
      date: logDate,
      completedBy: completedBy || 'Staff',
      notes: notes || '',
      photoUrl: photoUrl || '',
      status: 'done',
    });

    return task.save();
  }

  // Edit an existing log
  public async editLog(taskId: string, logId: string, notes?: string, photoUrl?: string) {
    const task = await CleaningTask.findById(taskId);
    if (!task) throw new Error('Cleaning task not found');

    const log = task.logs.find((l: any) => {
      const id = l?._id?.toString?.() ?? l?.id;
      return id === logId;
    }) as any;
    if (!log) throw new Error('Log not found');

    if (notes !== undefined) log.notes = notes;
    if (photoUrl !== undefined) log.photoUrl = photoUrl;
    log.status = 'edited';

    return task.save();
  }

  // Get all cleaning tasks for a user/business
  public async getTasksByUser(userId: string): Promise<ICleaningTask[]> {
    return CleaningTask.find({ userId });
  }

  // Get logs for a specific task (optionally filtered by date / range)
  public async getLogsByTask(taskId: string, date?: string, startDate?: string, endDate?: string) {
    const task = await CleaningTask.findById(taskId);
    if (!task) throw new Error('Cleaning task not found');

    let logs = task.logs;

    if (date) {
      const target = new Date(date);
      if (Number.isNaN(target.getTime())) throw new Error('Invalid date');
      const start = new Date(target); start.setHours(0, 0, 0, 0);
      const end = new Date(target); end.setHours(23, 59, 59, 999);
      logs = logs.filter((l: any) => {
        const d = new Date(l.date);
        return d >= start && d <= end;
      });
    }

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('1970-01-01');
      const end = endDate ? new Date(endDate) : new Date('2999-12-31');
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error('Invalid startDate or endDate');
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      logs = logs.filter((l: any) => {
        const d = new Date(l.date);
        return d >= start && d <= end;
      });
    }

    return logs;
  }
}

export default new CleaningService();
