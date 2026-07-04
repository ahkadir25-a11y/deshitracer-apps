import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

import fs from 'fs';
import multer from 'multer';
import config from '../../config';

cloudinary.config({
  cloud_name: config.cloudinaryName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export const sendImageToCloudinary = (
  imageName: string,
  path: string,
  folderName: string | undefined | null,
): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      {
        public_id: imageName,
        folder: folderName || config.cloudinaryImageFolderName,
      },
      function (error, result) {
        // Always clean up the temp file; log (don't reject) if cleanup fails,
        // since the promise may already be settled by then.
        fs.unlink(path, (err) => {
          if (err) {
            console.error('Failed to delete local file:', err);
          }
        });
        if (error) {
          return reject(error);
        }
        resolve(result as UploadApiResponse);
      },
    );
  });
};

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
export const sendImagesToCloudinary = async (
  images: Express.Multer.File[],
  folderName: string | undefined | null,
): Promise<string[]> => {
  try {
    const uploadPromises = images.map((image) => {
      return new Promise<string>((resolve, reject) => {
        const allowedVideoTypes = [
          'video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp', 'video/3gpp2'
        ];
        const allowedImageTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/heic', 'image/heif', 'image/heics', 'image/heifs', 'image/webp', 'image/avif', 'image/svg+xml'
        ];

        let resourceType: 'image' | 'video' | 'raw' | 'auto' | undefined;
        if (allowedVideoTypes.includes(image.mimetype)) {
          resourceType = 'video';
        } else if (allowedImageTypes.includes(image.mimetype)) {
          resourceType = 'image';  // 🔥 Force image for all allowed image types
        } else {
          resourceType = 'raw';  // fallback for unknown types (optional)
        }


        console.log('Uploading to Cloudinary:', {
          filename: image.filename,
          mimetype: image.mimetype,
          path: image.path,
          resourceType
        });

        cloudinary.uploader.upload(
          image.path,
          {
            public_id: image.filename,
            folder: folderName || config.cloudinaryImageFolderName,
            resource_type: resourceType,  // 🔥 Controlled here
          },
          (error, result) => {
            fs.unlink(image.path, (err) => {
              if (err) console.error('Failed to delete local file:', err);
            });

            if (error) {
              console.error('Cloudinary Upload Error for', image.filename, error);
              return reject(error);
            }

            resolve(result?.secure_url || '');
          },
        );
      });
    });

    const results = await Promise.all(uploadPromises);
    return results;

  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload images.');
  }
};


const storage = multer.diskStorage({
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


export const upload = multer({
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
    } else {
      console.error('Rejected file:', file.originalname, 'Mimetype:', file.mimetype);
      cb(null, false);
    }
  }


});

export default cloudinary;
