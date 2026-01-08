import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

export async function POST() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: false, message: 'Not available in production' });
    }

    try {
        const timestamp = Date.now();
        const draftId = `temp-${timestamp}`;
        const draftDir = path.join(process.cwd(), 'public/posts', draftId);

        await fs.mkdir(draftDir, { recursive: true });

        return NextResponse.json({ success: true, draftId });
    } catch (error) {
        console.error('Failed to init draft:', error);
        return NextResponse.json({ success: false, message: '초기화 실패' }, { status: 500 });
    }
}
