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
exports.upload = exports.sendImagesToCloudinary = exports.sendImageToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const config_1 = __importDefault(require("../../config"));
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloudinaryName,
    api_key: config_1.default.cloudinaryApiKey,
    api_secret: config_1.default.cloudinaryApiSecret,
});
const sendImageToCloudinary = (imageName, path, folderName) => {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload(path, {
            public_id: imageName,
            folder: folderName || config_1.default.cloudinaryImageFolderName,
        }, function (error, result) {
            // Always clean up the temp file; log (don't reject) if cleanup fails,
            // since the promise may already be settled by then.
            fs_1.default.unlink(path, (err) => {
                if (err) {
                    console.error('Failed to delete local file:', err);
                }
            });
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
};
exports.sendImageToCloudinary = sendImageToCloudinary;
// export const sendImagesToCloudinary = async (
//   images: Express.Multer.File[], // Expecting multiple files
//   folderName: string | undefined | null,
// ): Promise<string[]> => {
//   try {
//     const uploadPromises = images.map((image) => {
//       return new Promise<string>((resolve, reject) => {
//         const resourceType = image.mimetype.startsWith('image/')
//           ? 'image'
//           : 'video';
//         cloudinary.uploader.upload(
//           image.path,
//           {
//             public_id: image.filename, // Unique filename for Cloudinary
//             folder: folderName || config.cloudinaryImageFolderName,
//             resource_type: resourceType,
//           },
//           (error, result) => {
//             // Remove file from local storage after upload
//             fs.unlink(image.path, (err) => {
//               if (err) {
//                 console.error('Failed to delete local file:', err);
//               }
//             });
//             if (error) {
//               return reject(error);
//             }
//             resolve(result?.secure_url || '');
//           },
//         );
//       });
//     });
//     // Wait for all images to upload
//     const results = await Promise.all(uploadPromises);
//     // console.log('All uploads completed:', results);
//     return results;
//   } catch (error) {
//     console.error('Cloudinary Upload Error:', error);
//     throw new Error('Failed to upload images.');
//   }
// };
const sendImagesToCloudinary = (images, folderName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadPromises = images.map((image) => {
            return new Promise((resolve, reject) => {
                const allowedVideoTypes = [
                    'video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/3gpp2'
                ];
                const allowedImageTypes = [
                    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/heic', 'image/heif', 'image/heics', 'image/heifs', 'image/webp', 'image/avif', 'image/svg+xml'
                ];
                let resourceType;
                if (allowedVideoTypes.includes(image.mimetype)) {
                    resourceType = 'video';
                }
                else if (allowedImageTypes.includes(image.mimetype)) {
                    resourceType = 'image'; // 🔥 Force image for all allowed image types
                }
                else {
                    resourceType = 'raw'; // fallback for unknown types (optional)
                }
                console.log('Uploading to Cloudinary:', {
                    filename: image.filename,
                    mimetype: image.mimetype,
                    path: image.path,
                    resourceType
                });
                cloudinary_1.v2.uploader.upload(image.path, {
                    public_id: image.filename,
                    folder: folderName || config_1.default.cloudinaryImageFolderName,
                    resource_type: resourceType, // 🔥 Controlled here
                }, (error, result) => {
                    fs_1.default.unlink(image.path, (err) => {
                        if (err)
                            console.error('Failed to delete local file:', err);
                    });
                    if (error) {
                        console.error('Cloudinary Upload Error for', image.filename, error);
                        return reject(error);
                    }
                    resolve((result === null || result === void 0 ? void 0 : result.secure_url) || '');
                });
            });
        });
        const results = yield Promise.all(uploadPromises);
        return results;
    }
    catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Failed to upload images.');
    }
});
exports.sendImagesToCloudinary = sendImagesToCloudinary;
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = process.cwd() + '/uploads/';
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = file.fieldname + '-' + uniqueSuffix;
        cb(null, filename);
    },
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    // Cap file size and count so a single client can't fill the server disk (DoS).
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB per file (covers short videos)
        files: 8,
    },
    fileFilter: (req, file, cb) => {
        // SVG removed — it can carry embedded scripts (stored-XSS if ever rendered).
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/heic', 'image/heif', 'image/webp', 'image/avif',
            'video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/3gpp2'
        ];
        console.log('Checking file:', file.originalname, 'Mimetype:', file.mimetype);
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            console.error('Rejected file:', file.originalname, 'Mimetype:', file.mimetype);
            cb(null, false);
        }
    }
});
exports.default = cloudinary_1.v2;
