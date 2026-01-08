'use client'

import {Suspense, useEffect, useState} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import Link from 'next/link'
import {Post} from '@/shared/lib/blog'
import {AnimatePresence, motion} from 'framer-motion'
import ThemeModeButton from "@/features/theme-toggle";

interface BlogClientPageProps {
  initialPosts: Post[]
  categories: string[]
  tags: string[]
}

const ITEMS_PER_PAGE = 5

// Suspense가 필요한 useSearchParams를 사용하는 내부 컴포넌트
function BlogContent({ initialPosts, categories, tags }: BlogClientPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeCategory = searchParams.get('category') || 'All'
  const activeTag = searchParams.get('tag') || null
  const currentPage = Number(searchParams.get('page')) || 1

  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts)

  useEffect(() => {
    let result = initialPosts

    if (activeCategory !== 'All') {
      result = result.filter((post) => post.category === activeCategory)
    }

    if (activeTag) {
      result = result.filter((post) => post.tags.includes(activeTag))
    }

    setFilteredPosts(result)
  }, [activeCategory, activeTag, initialPosts])

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'All') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.set('page', '1') // 리셋
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Blog
            <ThemeModeButton/>
        </h1>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {['All', ...categories].map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {paginatedPosts.map((post) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {post.category}
                  </span>
                  <span>•</span>
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                </div>
                <Link href={`/${post.slug}`} className="block">
                  <h2 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {post.title}
                  </h2>
                </Link>
                <p className="line-clamp-2 text-gray-600 dark:text-gray-300">
                  {post.excerpt || post.content.slice(0, 150)}...
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-400/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {paginatedPosts.length === 0 && (
          <div className="py-20 text-center text-gray-500">게시글이 없습니다.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlogClientPage(props: BlogClientPageProps) {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <BlogContent {...props} />
    </Suspense>
  )
}
