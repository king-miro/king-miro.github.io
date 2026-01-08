import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ exists: false });
    }

    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ exists: false });
    }

    const finalFilename = filename.endsWith('.mdx') ? filename.replace(/\.mdx$/, '') : filename;
    const filePath = path.join(process.cwd(), 'public/posts', finalFilename);

    try {
        await fs.access(filePath);
        return NextResponse.json({ exists: true });
    } catch {
        return NextResponse.json({ exists: false });
    }
}
