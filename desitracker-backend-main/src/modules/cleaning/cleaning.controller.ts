import { Request, Response } from 'express';
import cleaningService from './cleaning.service';
import { canAccessUserScopedData } from '../../utils/lib/businessAccess';
import CleaningTask from './cleaning.model';

// The GET routes here were guarded against cross-tenant reads but the writes
// were not, so any authenticated staff member could create tasks under another
// business or falsify its cleaning records. These are food-safety logs; a
// forged entry is a compliance problem, not just bad data.
const denyIfNotAllowed = async (req: Request, res: Response, targetUserId: any): Promise<boolean> => {
  const caller = (req as any).user;
  const allowed = await canAccessUserScopedData(
    caller?.id,
    caller?.role,
    targetUserId ? String(targetUserId) : undefined,
    caller?.email,
  );
  if (!allowed) {
    res.status(403).json({ message: 'You are not authorized to change this data' });
    return true;
  }
  return false;
};

// A log is written against a task id, so the owner has to be read off the task
// itself — the caller does not get to say whose record this is.
const ownerOfTask = async (taskId: any): Promise<string | undefined> => {
  const task = await CleaningTask.findById(String(taskId || '')).select('userId').lean();
  return (task as any)?.userId ? String((task as any).userId) : undefined;
};

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred';
};

class CleaningController {
  // Create a cleaning task
  public async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { userId, taskName, area, frequency, intervalDays } = req.body;
      if (await denyIfNotAllowed(req, res, userId)) return;
      const task = await cleaningService.createTask(
        userId,
        taskName,
        area,
        frequency,
        intervalDays != null ? Number(intervalDays) : null,
      );
      res.status(201).json(task);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Add a completion log (check-off)
  public async addLog(req: Request, res: Response): Promise<void> {
    try {
      const { taskId, completedBy, notes, photoUrl, date } = req.body;
      if (await denyIfNotAllowed(req, res, await ownerOfTask(taskId))) return;
      const updated = await cleaningService.addLog(taskId, completedBy, notes, photoUrl, date);
      res.status(200).json(updated);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Edit a log
  public async editLog(req: Request, res: Response): Promise<void> {
    try {
      const { taskId, logId, notes, photoUrl } = req.body;
      if (await denyIfNotAllowed(req, res, await ownerOfTask(taskId))) return;
      const updated = await cleaningService.editLog(taskId, logId, notes, photoUrl);
      res.status(200).json(updated);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Get all tasks for a user/business
  public async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Prevent cross-tenant reads: caller must be the target user, an admin,
      // or staff of a business owned by that user.
      const caller = (req as any).user;
      const allowed = await canAccessUserScopedData(
        caller?.id,
        caller?.role,
        userId,
        caller?.email,
      );
      if (!allowed) {
        res.status(403).json({ message: 'You are not authorized to view this data' });
        return;
      }

      const tasks = await cleaningService.getTasksByUser(userId);
      if (!tasks || (Array.isArray(tasks) && tasks.length === 0)) {
        res.status(404).json({ message: 'No cleaning tasks found for this user' });
        return;
      }
      res.status(200).json(tasks);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Get logs for a task
  public async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { date, startDate, endDate } = req.query;
      const logs = await cleaningService.getLogsByTask(
        taskId,
        date as string | undefined,
        startDate as string | undefined,
        endDate as string | undefined
      );
      res.status(200).json(logs);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }
}

export default new CleaningController();
