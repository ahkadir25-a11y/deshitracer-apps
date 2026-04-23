import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const sliderDir = path.join(process.cwd(), 'public', 'slider');

export async function GET() {
  try {
    await fs.mkdir(sliderDir, { recursive: true }); // Ensure directory exists
    const files = await fs.readdir(sliderDir);
    // Filter only image files (basic extension check)
    const images = files.filter(file =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}