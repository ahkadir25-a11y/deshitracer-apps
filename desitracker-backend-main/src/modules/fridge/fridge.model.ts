import { Schema, model } from 'mongoose';
import { IFridge } from './fridge.interface';

const FridgeRecordSchema = new Schema(
  {
    date: { type: Date, required: true },
    minTemperature: { type: Number, required: true },
    maxTemperature: { type: Number, required: true },
    status: { type: String, enum: ["created", "edited"], default: "created" },
  },
  { _id: true } // ✅ give each record its own id
);


const FridgeSchema = new Schema<IFridge>({
    fridgeName: { type: String, required: true },
    fridgeLocation: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User', index: true },  // Reference to user (assuming a User model exists)
    temperatureRecords: [FridgeRecordSchema]
});

const Fridge = model<IFridge>('Fridge', FridgeSchema);
export default Fridge;
