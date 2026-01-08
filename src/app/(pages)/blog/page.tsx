import { getAllPosts, getUniqueCategories, getUniqueTags } from '@/shared/lib/blog'
import BlogClientPage from './_components/blog-client-page'
import DevFloatingButton from './_components/dev-floating-button'

export const metadata = {
  title: 'Blog',
  description: 'Technical Writing and Tutorials',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const categories = getUniqueCategories()
  const tags = getUniqueTags()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black">
      <BlogClientPage initialPosts={posts} categories={categories} tags={tags} />
      <DevFloatingButton />
    </main>
  )
}
