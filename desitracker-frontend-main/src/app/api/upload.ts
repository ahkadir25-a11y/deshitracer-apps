import { IncomingForm, Files, Fields, File as FormidableFile } from 'formidable';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Disable body parsing by Next.js for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Extend NextApiRequest to include form data
interface NextApiRequestWithForm extends NextApiRequest {
  form?: {
    fields: Fields;
    files: Files;
  };
}

// Middleware function to handle file uploads
const uploadForm = (next: NextApiHandler) => async (req: NextApiRequestWithForm, res: NextApiResponse) => {
  try {
    const form = new IncomingForm({
      multiples: true,          // Support multiple files
      keepExtensions: true,     // Preserve file extensions
    });

    form.once('error', (err) => console.error('Error during upload:', err));

    form
      .on('fileBegin', (name, file) => {
        // Use originalFilename or newFilename
        const filename = (file as FormidableFile).originalFilename ?? (file as FormidableFile).newFilename ?? 'unknown';
        console.log('Start uploading:', filename);
      })
      .on('aborted', () => console.log('Upload aborted...'))
      .once('end', () => {
        console.log('Upload complete!');
      });

    await new Promise<void>((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          reject(err);
          return;
        }

        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        for (const file of fileArray) {
          const formidableFile = file as FormidableFile;
          const originalFilename = formidableFile.originalFilename ?? formidableFile.newFilename ?? 'unknown';
          const filepath = formidableFile.filepath; // or formidableFile.path in older versions

          console.log('Moving file:', filepath, 'to', `public/upload/${originalFilename}`);

          try {
            const destinationPath = path.join(process.cwd(), 'public', 'upload', originalFilename);
            fs.renameSync(filepath, destinationPath);
          } catch (moveError) {
            console.error('Error moving file:', moveError);
            reject(moveError);
          }
        }

        req.form = { fields, files };
        resolve();
      });
    });

    return next(req, res);
  } catch (error) {
    console.error('Error handling file upload:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// Main handler function
const handler: NextApiHandler = (req, res) => {
  try {
    if (req.method === 'POST') {
      const formData = (req as NextApiRequestWithForm).form;
      res.status(200).json(formData ?? { message: 'No form data found' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Bad Request', error });
  }
};

export default uploadForm(handler);
