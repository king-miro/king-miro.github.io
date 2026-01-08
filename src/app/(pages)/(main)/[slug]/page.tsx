import { getPostBySlug, getAllPosts } from '@/shared/lib/blog'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { MDXComponents } from '@/shared/ui/mdx-components'
import DevFloatingButton from '../_components/dev-floating-button'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const post = getPostBySlug(slug)
    return {
      title: post.title,
      description: post.excerpt,
    }
  } catch (e) {
    return {
      title: 'Post Not Found',
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post
  try {
    post = getPostBySlug(slug)
  } catch (e) {
    notFound()
  }

  return (
    <article className="min-h-screen bg-white pt-10 pb-20 dark:bg-black">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 flex justify-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {post.category}
            </span>
          </div>
          <h1 className="mb-4 text-4xl leading-tight font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
            <time className="text-sm">{new Date(post.date).toLocaleDateString()}</time>
            {post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <article className="prose prose-lg dark:prose-invert mx-auto max-w-none break-words">
          <MDXRemote
            source={post.content}
            components={{
              ...MDXComponents as any,
              img: (props: any) => {
                let src = props.src;
                if (src && !src.startsWith('http') && !src.startsWith('/')) {
                  // Relative path: resolve to /posts/[slug]/[src]
                  src = `/posts/${slug}/${src}`;
                }
                return <img {...props} src={src} alt={props.alt || ''} className="my-8 h-auto w-full rounded-lg shadow-md" />;
              }
            }}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkBreaks],
              },
            }}
          />
        </article>
      </div>
      <DevFloatingButton />
    </article>
  )
}
