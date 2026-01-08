import fs from 'fs'
import path from 'path'
import { getPostSlugs } from '@/shared/lib/blog'
import EditorClient from './_components/editor-client'
import { notFound, redirect } from 'next/navigation'

// Static Export를 위해 모든 케이스를 미리 빌드해야 함
export async function generateStaticParams() {
  const slugs = getPostSlugs()

  // 1. 빈 slug (새 글 작성: /editor) - [[...slug]] catch-all
  const paths = [{ slug: [] }]

  // 2. 각 포스트 slug (글 수정: /editor/hello-world)
  const postPaths = slugs.map((slug) => ({
    slug: [slug],
  }))

  return [...paths, ...postPaths]
}

export default async function EditorPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  // 프로덕션 빌드 실행 시 (런타임 체크) 리다이렉트
  if (process.env.NODE_ENV === 'production') {
    redirect('/')
  }

  const { slug } = await params
  const postSlug = slug?.[0] // [[...slug]] returns array

  let initialContent = ''

  if (postSlug) {
    const postsDirectory = path.join(process.cwd(), 'public/posts')
    const fullPath = path.join(postsDirectory, postSlug, 'index.mdx')

    try {
      if (fs.existsSync(fullPath)) {
        initialContent = fs.readFileSync(fullPath, 'utf8')
      } else {
        // slug는 있는데 파일이 없으면 404
        notFound()
      }
    } catch (error) {
      console.error('Error reading file:', error)
      notFound()
    }
  }

  return <EditorClient initialContent={initialContent} slug={postSlug} />
}
