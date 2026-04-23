// settings/settings.model.ts
import mongoose, { Schema, Document } from 'mongoose';

interface ISettings extends Document {
  logo: string;
  email: string;
  phoneNumber: string;
  location: string;
}

const settingsSchema: Schema = new Schema({
  logo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  siteName: {
    type: String,
    required: true,
  },
});

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;
