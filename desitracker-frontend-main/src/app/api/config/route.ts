import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text(); // Accept raw text for full control
    const parsed = JSON.parse(raw); // Validate JSON before saving

    const configPath = path.join(process.cwd(), 'public', 'config.json');
    await fs.writeFile(configPath, JSON.stringify(parsed, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write config.json:', error);
    return NextResponse.json({ error: 'Invalid config or write failed' }, { status: 500 });
  }
}
