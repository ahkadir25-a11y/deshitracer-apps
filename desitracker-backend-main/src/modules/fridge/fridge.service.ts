import Fridge from './fridge.model';
import { IFridge } from './fridge.interface';

class FridgeService {
    // Create a new fridge for the user
    public async createFridge(userId: string, fridgeName: string, fridgeLocation: string): Promise<IFridge> {
        const fridge = new Fridge({ userId, fridgeName, fridgeLocation, temperatureRecords: [] });
        return fridge.save();
    }

    // Add a temperature record for a specific fridge
    public async addTemperatureRecord(
        fridgeId: string,
        minTemperature: number,
        maxTemperature: number,
        date?: string
    ): Promise<IFridge> {
        const fridge = await Fridge.findById(fridgeId);
        if (!fridge) throw new Error("Fridge not found");

        const recordDate = date ? new Date(date) : new Date();

        if (Number.isNaN(recordDate.getTime())) {
            throw new Error("Invalid date");
        }

        fridge.temperatureRecords.push({
            date: recordDate, // ✅ use user date
            minTemperature,
            maxTemperature,
            status: "created",
        });

        return fridge.save();
    }

    // Edit an existing temperature record for a fridge
    public async editTemperatureRecord(fridgeId: string, recordId: string, minTemperature: number, maxTemperature: number) {
        const fridge = await Fridge.findById(fridgeId);
        if (!fridge) throw new Error("Fridge not found");

        const record = fridge.temperatureRecords.find((r: any) => {
            const id = r?._id?.toString?.() ?? r?.id; // mongoose subdocs usually have _id + id getter
            return id === recordId;
        }) as any;
        if (!record) throw new Error("Record not found");

        record.minTemperature = minTemperature;
        record.maxTemperature = maxTemperature;
        record.status = "edited";

        return fridge.save();
    }


    // Get all fridges for a specific user
    public async getFridgesByUser(userId: string): Promise<IFridge[]> {
        return Fridge.find({ userId });
    }

    // Get temperature records for a specific fridge
    public async getTemperatureRecordsByFridge(
        fridgeId: string,
        date?: string,
        startDate?: string,
        endDate?: string
    ) {
        const fridge = await Fridge.findById(fridgeId);
        if (!fridge) throw new Error('Fridge not found');

        let records = fridge.temperatureRecords;

        // filter by exact single date
        if (date) {
            const targetDate = new Date(date);
            if (Number.isNaN(targetDate.getTime())) {
                throw new Error('Invalid date');
            }

            const start = new Date(targetDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(targetDate);
            end.setHours(23, 59, 59, 999);

            records = records.filter((record: any) => {
                const recordDate = new Date(record.date);
                return recordDate >= start && recordDate <= end;
            });
        }

        // filter by date range
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date('2999-12-31');

            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                throw new Error('Invalid startDate or endDate');
            }

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            records = records.filter((record: any) => {
                const recordDate = new Date(record.date);
                return recordDate >= start && recordDate <= end;
            });
        }

        return records;
    }
}

export default new FridgeService();
