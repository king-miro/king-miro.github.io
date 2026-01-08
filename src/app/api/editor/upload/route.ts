import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: true, message: 'Build mode' });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const postId = formData.get('postId') as string;

        if (!file || !postId) {
            return NextResponse.json({ success: false, message: '파일과 Post ID는 필수입니다.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${Date.now()}-${originalName}`;

        // Save to public/posts/[postId]/
        const uploadDir = path.join(process.cwd(), 'public/posts', postId);
        const filePath = path.join(uploadDir, filename);

        // Ensure directory exists (it should exist if created by init or exists as post)
        await fs.mkdir(uploadDir, { recursive: true });

        await fs.writeFile(filePath, buffer);

        // Return RELATIVE path: "filename" 
        // Logic: Markdwon will be "![alt](filename)"
        return NextResponse.json({
            success: true,
            // Return just filename for relative path usage, OR full URL if we want to show it immediately in editor?
            // If we use relative path in markdown, we return just filename. 
            // BUT editor preview needs to resolve it. Editor needs to know how to resolve it.
            // Let's return the filename. The editor client will handle the insertion as relative path.
            url: filename,
            message: '이미지 업로드 성공'
        });
    } catch (error) {
        console.error('Image upload failed:', error);
        return NextResponse.json({ success: false, message: '이미지 업로드 실패' }, { status: 500 });
    }
}
