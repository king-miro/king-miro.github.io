import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'public/posts')

export interface Post {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  content: string
  excerpt?: string
}

/**
 * Get all post slugs
 */
export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  // Get directories instead of files
  return fs.readdirSync(postsDirectory).filter((file) => {
    const isDirectory = fs.statSync(path.join(postsDirectory, file)).isDirectory()
    return isDirectory && !file.startsWith('temp-')
  })
}

/**
 * 특정 슬러그의 포스트 데이터를 가져옵니다.
 */
/**
 * 특정 슬러그의 포스트 데이터를 가져옵니다.
 */
export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.mdx$/, '')
  const fullPath = path.join(postsDirectory, realSlug, 'index.mdx')

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug} `)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // Smart Whitelist: 허용된 태그가 아니면 자동으로 이스케이프 처리
  // 표준 HTML 태그 목록 + 커스텀 컴포넌트(필요 시 추가)
  const ALLOWED_TAGS = [
    'a', 'p', 'span', 'div', 'img', 'h[1-6]', 'ul', 'ol', 'li', 'br', 'hr',
    'code', 'pre', 'blockquote',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'iframe', 'section', 'article', 'header', 'footer', 'nav', 'aside',
    'details', 'summary', 'figure', 'figcaption',
    'Callout', // 예시: 커스텀 컴포넌트
  ].join('|')

  // 정규식: < 뒤에 (허용된 태그 + 공백/슬래시/끝)이 오지 않는 모든 < 를 찾음
  // (?!/?) -> 태그명 앞에 / 가 있을 수도 있음 (닫는 태그)
  const safeContent = content.replace(new RegExp(`<(?!\/?(?:${ALLOWED_TAGS})(?:[\\s/>]|$))`, 'ig'), '&lt;')

  return {
    slug: realSlug,
    title: data.title || 'Untitled',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    category: data.category || 'Uncategorized',
    tags: data.tags || [],
    content: safeContent,
    excerpt: data.excerpt || '',
  } as Post
}

/**
 * 모든 포스트를 날짜 역순(최신순)으로 정렬하여 가져옵니다.
 */
export function getAllPosts(): Post[] {
  const slugs = getPostSlugs()

  return slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
}

/**
 * 모든 포스트에서 중복되지 않는 카테고리 목록을 가져옵니다.
 */
export function getUniqueCategories(): string[] {
  const posts = getAllPosts()
  const categories = posts.map((post) => post.category).filter(Boolean)
  return Array.from(new Set(categories))
}

/**
 * 모든 포스트에서 중복되지 않는 태그 목록을 가져옵니다.
 */
export function getUniqueTags(): string[] {
  const posts = getAllPosts()
  const tags = posts.flatMap((post) => post.tags).filter(Boolean)
  return Array.from(new Set(tags))
}
