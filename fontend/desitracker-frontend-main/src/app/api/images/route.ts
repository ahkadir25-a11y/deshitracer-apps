import { NextRequest, NextResponse } from 'next/server';

import fs from 'fs/promises';
import path from 'path';

// Disable body parser for the multipart form data
export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle the file upload with formidable
  },
};

// Define the slider directory where files will be saved
const sliderDir = path.join(process.cwd(), 'public', 'slider');

// Ensure the slider directory exists
async function ensureSliderDir() {
  try {
    await fs.mkdir(sliderDir, { recursive: true });
  } catch (error) {
    console.error('Error creating slider directory:', error);
  }
}


// Helper function to decode the Base64 string
async function saveBase64File(base64String: string, fileName: string) {
  const base64Data = base64String.split(';base64,').pop(); // Extract base64 data
  if (!base64Data) throw new Error('Invalid Base64 string');

  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = path.join(sliderDir, fileName);

  await fs.writeFile(filePath, buffer); // Write the file to the slider directory
  return filePath;
}

// POST handler for uploading images
export const POST = async (req: NextRequest) => {
  const { fileName, base64 } = await req.json(); // Get the file name and Base64 string

  if (!fileName || !base64) {
    return NextResponse.json({ error: 'File name or Base64 string is missing' }, { status: 400 });
  }

  await ensureSliderDir();  // Ensure the slider directory exists

  try {
    const filePath = await saveBase64File(base64, fileName); // Save the file
    return NextResponse.json({ message: 'Image uploaded successfully', filePath });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
  }
};

// DELETE handler for removing images
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Prevent path traversal by sanitizing the filename
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(sliderDir, sanitizedFilename);

  try {
    // Check if the file exists
    await fs.access(filePath);
    // Delete the file
    await fs.unlink(filePath);
    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
