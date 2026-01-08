import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'public/posts');

if (fs.existsSync(postsDir)) {
    console.log('Cleaning up temp folders in public/posts...');
    const files = fs.readdirSync(postsDir);

    files.forEach(file => {
        if (file.startsWith('temp-')) {
            const filePath = path.join(postsDir, file);
            if (fs.statSync(filePath).isDirectory()) {
                fs.rmSync(filePath, { recursive: true, force: true });
                console.log(`Deleted: ${file}`);
            }
        }
    });
    console.log('Cleanup complete.');
} else {
    console.log('public/posts directory not found, skipping cleanup.');
}
