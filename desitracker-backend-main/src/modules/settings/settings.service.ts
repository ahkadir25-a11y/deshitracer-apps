// settings/settings.service.ts
import Settings from './settings.model';
import { ISettings } from './settings.interface';

class SettingsService {
  // Create a new settings entry (only allowed if no settings exist)
  async createSettings(settingsData: ISettings) {
    try {
      const existingSettings = await Settings.findOne(); // Check if settings already exist
      if (existingSettings) {
        throw new Error('Settings already exist. You can only update them.');
      }

      const settings = new Settings(settingsData);
      await settings.save();
      return settings;
    } catch (error) {
      console.error('Error creating settings:', error);
      throw new Error('Failed to create settings');
    }
  }

  // Get the settings (if they exist, return them; if not, return null)
  async getSettings() {
    try {
      const settings = await Settings.findOne(); // Returns the first settings document
      return settings; // Will be null if no settings found
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to retrieve settings');
    }
  }

  // Update the existing settings (only one settings entry is allowed)
  async updateSettings(settingsData: ISettings) {
    try {
      // Check if any settings exist
      const existingSettings = await Settings.findOne();

      // If no settings exist, create a new one
      if (!existingSettings) {
        const newSettings = new Settings(settingsData);
        await newSettings.save();
        return newSettings;  // Return newly created settings
      }

      // If settings exist, update the settings
      const updatedSettings = await Settings.findOneAndUpdate({}, settingsData, { new: true });
      if (!updatedSettings) {
        throw new Error('Failed to update settings');
      }
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

}

export default new SettingsService();
