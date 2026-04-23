"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadImageControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendImageToCloudinery_1 = require("../../utils/lib/sendImageToCloudinery");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const uploadMultipleImages = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // console.log('uploadMultipleImages controller called');
    const files = req.files;
    // console.log('Number of files received:', files ? files.length : 0);
    const result = yield (0, sendImageToCloudinery_1.sendImagesToCloudinary)(files, (_a = req.params) === null || _a === void 0 ? void 0 : _a.folder);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Images uploaded successfully',
        data: result,
    });
}));
exports.UploadImageControllers = {
    uploadMultipleImages,
};
