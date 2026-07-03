import { Request, Response } from 'express';
import fridgeService from './fridge.service';
import { canAccessUserScopedData } from '../../utils/lib/businessAccess';

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred';
};

class FridgeController {
  // Create a new fridge for a user
  public async createFridge(req: Request, res: Response): Promise<void> {
    try {
      const { userId, fridgeName, fridgeLocation } = req.body;

      const fridge = await fridgeService.createFridge(
        userId,
        fridgeName,
        fridgeLocation
      );

      res.status(201).json(fridge);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Add a temperature record for a specific fridge
  public async addTemperatureRecord(req: Request, res: Response): Promise<void> {
    try {
      const { fridgeId, minTemperature, maxTemperature, date } = req.body; // include date

      const updatedFridge = await fridgeService.addTemperatureRecord(
        fridgeId,
        minTemperature,
        maxTemperature,
        date
      );

      res.status(200).json(updatedFridge);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Edit a temperature record
  public async editTemperatureRecord(req: Request, res: Response): Promise<void> {
    try {
      const { fridgeId, recordId, minTemperature, maxTemperature } = req.body;

      const updatedFridge = await fridgeService.editTemperatureRecord(
        fridgeId,
        recordId,
        minTemperature,
        maxTemperature
      );

      res.status(200).json(updatedFridge);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Get all fridges for a specific user
  public async getFridges(req: Request, res: Response): Promise<void> {
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

      const fridges = await fridgeService.getFridgesByUser(userId);

      // if service returns [] or null/undefined, handle both
      if (!fridges || (Array.isArray(fridges) && fridges.length === 0)) {
        res.status(404).json({ message: 'No fridges found for this user' });
        return;
      }

      res.status(200).json(fridges);
    } catch (error: unknown) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  }

  // Get temperature records for a specific fridge
public async getTemperatureRecords(req: Request, res: Response): Promise<void> {
  try {
    const { fridgeId } = req.params;
    const { date, startDate, endDate } = req.query;

    const records = await fridgeService.getTemperatureRecordsByFridge(
      fridgeId,
      date as string | undefined,
      startDate as string | undefined,
      endDate as string | undefined
    );

    res.status(200).json(records);
  } catch (error: unknown) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
}
}

export default new FridgeController();