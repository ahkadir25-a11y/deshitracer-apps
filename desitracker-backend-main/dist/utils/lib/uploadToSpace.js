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
exports.upload2 = exports.sendImageToCloudinary2 = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("../../config"));
// Configure disk storage (you can switch to memoryStorage if needed)
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder to temporarily store files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// File filter to allow any image format
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinaryName,
    api_key: config_1.default.cloudinaryApiKey,
    api_secret: config_1.default.cloudinaryApiSecret,
});
const sendImageToCloudinary2 = (name, path, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield cloudinary_1.v2.uploader.upload(path, {
        public_id: name,
        folder,
        resource_type: 'image', // Allow Cloudinary to handle any image type
        format: undefined, // Let Cloudinary infer the format
    });
    return { secure_url: result.secure_url };
});
exports.sendImageToCloudinary2 = sendImageToCloudinary2;
exports.upload2 = (0, multer_1.default)({ storage, fileFilter });
