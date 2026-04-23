// settings/settings.controller.ts
import { Request, Response } from 'express';
import SettingsService from './settings.service';
import handleAsyncRequest from '../../utils/handleAsyncRequest';
import sendResponse from '../../utils/sendResponse';

const createSettings = handleAsyncRequest(async (req: Request, res: Response) => {
    const settingsData = req.body;
    const newSettings = await SettingsService.createSettings(settingsData);

    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: 'Settings created successfully!',
        data: newSettings,
    });
});

const getSettings = handleAsyncRequest(async (req: Request, res: Response) => {
    const settings = await SettingsService.getSettings();

    // If settings don't exist, inform the frontend to show the "create settings" UI
    if (!settings) {
        return sendResponse(res, {
            success: false,
            statusCode: 404,
            message: 'No settings found, please create them.',
            data: null,
        });
    }

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Settings retrieved successfully!',
        data: settings,
    });
});

const updateSettings = handleAsyncRequest(async (req: Request, res: Response) => {
    const settingsData = req.body;
    const updatedSettings = await SettingsService.updateSettings(settingsData);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Settings updated successfully!',
        data: updatedSettings,
    });
});

export const SettingsController = {
    createSettings,
    getSettings,
    updateSettings,
};
