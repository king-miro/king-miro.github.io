import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: true, message: 'Build mode' });
    }

    try {
        const body = await request.json();
        const { filename, content, currentId } = body; // filename is the TARGET slug

        if (!filename || !content || !currentId) {
            return NextResponse.json({ success: false, message: '필수 데이터 누락' }, { status: 400 });
        }

        const targetSlug = filename.replace(/\.mdx$/, '');
        const postsDir = path.join(process.cwd(), 'public/posts');
        const currentPath = path.join(postsDir, currentId);
        const targetPath = path.join(postsDir, targetSlug);

        // check if target exists and is NOT the same as current
        if (currentId !== targetSlug) {
            try {
                await fs.access(targetPath);
                // Target exists. If we are renaming temp -> target, or targetA -> targetB
                // If target exists, we might be overwriting? 
                // The client side checks for existence. If user confirmed overwrite, we should handle it.
                // But fs.rename might fail if directory exists and is not empty.
                // For safety, let's assume we are overwriting content, but we need to merge folders?
                // Or simply rename current to target, replacing it?
                // Replacing a directory is dangerous.

                // Simplified Logic: 
                // If overwriting, move contents of current to target? 
                // Actually, if overwriting, usually we just update the index.mdx in the target.
                // BUT what about the images uploaded to 'temp'? 
                // We MUST move the 'temp' images to 'target' folder.

                // If target exists, move files from current to target
                // Logic:
                // 1. Copy/Move all files from currentPath to targetPath
                // 2. Remove currentPath

                const files = await fs.readdir(currentPath);
                for (const file of files) {
                    await fs.rename(path.join(currentPath, file), path.join(targetPath, file));
                }
                await fs.rmdir(currentPath);

            } catch (e) {
                // Target does not exist, safe to rename full directory
                await fs.rename(currentPath, targetPath);
            }
        }

        // Now save the index.mdx content
        const indexPath = path.join(targetPath, 'index.mdx');
        await fs.writeFile(indexPath, content, 'utf-8');

        revalidatePath('/blog');
        revalidatePath(`/blog/${targetSlug}`);

        return NextResponse.json({ success: true, message: '성공적으로 저장되었습니다.', newSlug: targetSlug });
    } catch (error) {
        console.error('Failed to save post:', error);
        return NextResponse.json({ success: false, message: '저장 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
