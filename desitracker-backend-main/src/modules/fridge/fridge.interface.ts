import { Document } from 'mongoose';

export interface IFridgeRecord {
    date: Date;
    minTemperature: number;
    maxTemperature: number;
    status: 'created' | 'edited';  // Track whether the record is created or edited
}

export interface IFridge extends Document {
    fridgeName: string;
    fridgeLocation: string;
    userId: string;
    temperatureRecords: IFridgeRecord[];
}
