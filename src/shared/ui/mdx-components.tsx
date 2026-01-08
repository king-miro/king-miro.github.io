import Link from 'next/link'
import { ComponentPropsWithoutRef } from 'react'

type HeadingProps = ComponentPropsWithoutRef<'h1'>
type ParagraphProps = ComponentPropsWithoutRef<'p'>
type ListProps = ComponentPropsWithoutRef<'ul'>
type ListItemProps = ComponentPropsWithoutRef<'li'>
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>
type AnchorProps = ComponentPropsWithoutRef<'a'>
type CodeProps = ComponentPropsWithoutRef<'code'>
type ImageProps = ComponentPropsWithoutRef<'img'>

export const MDXComponents = {
  h1: ({ className, ...props }: HeadingProps) => (
    <h1
      className={`mt-10 mb-6 text-4xl font-extrabold text-gray-900 dark:text-white ${className || ''}`}
      {...props}
    />
  ),
  h2: ({ className, ...props }: HeadingProps) => (
    <h2
      className={`mt-10 mb-4 border-b border-gray-200 pb-2 text-3xl font-bold text-gray-900 dark:border-gray-800 dark:text-white ${className || ''}`}
      {...props}
    />
  ),
  h3: ({ className, ...props }: HeadingProps) => (
    <h3
      className={`mt-8 mb-4 text-2xl font-bold text-gray-900 dark:text-white ${className || ''}`}
      {...props}
    />
  ),
  h4: ({ className, ...props }: HeadingProps) => (
    <h4
      className={`mt-6 mb-4 text-xl font-semibold text-gray-900 dark:text-white ${className || ''}`}
      {...props}
    />
  ),
  p: ({ className, ...props }: ParagraphProps) => (
    <p
      className={`text-lg/relaxed text-gray-800 dark:text-gray-300 ${className || ''}`}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ListProps) => (
    <ul
      className={`mb-4 ml-6 list-outside list-disc space-y-1 text-gray-800 dark:text-gray-300 ${className || ''}`}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ListProps) => (
    <ol
      className={`mb-4 ml-6 list-outside list-decimal space-y-2 text-gray-800 dark:text-gray-300 ${className || ''}`}
      {...props}
    />
  ),
  li: ({ className, ...props }: ListItemProps) => (
    <li className={`text-lg/relaxed ${className || ''}`} {...props} />
  ),
  blockquote: ({ className, ...props }: BlockquoteProps) => (
    <blockquote
      className={`my-8 border-l-4 border-blue-500 bg-blue-50/50 py-4 pl-6 text-gray-700 italic dark:border-blue-400 dark:bg-blue-900/10 dark:text-gray-300 ${className || ''}`}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: AnchorProps) => {
    const isInternal = href?.startsWith('/')
    if (isInternal) {
      return (
        <Link
          href={href as string}
          className={`font-medium text-blue-600 underline decoration-blue-300 decoration-2 underline-offset-2 hover:text-blue-800 hover:decoration-blue-500 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300 ${className || ''}`}
          {...props}
        />
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium text-blue-600 underline decoration-blue-300 decoration-2 underline-offset-2 hover:text-blue-800 hover:decoration-blue-500 dark:text-blue-400 dark:decoration-blue-700 dark:hover:text-blue-300 ${className || ''}`}
        {...props}
      />
    )
  },
  code: ({ className, ...props }: CodeProps) => (
    <code
      className={`rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-200 ${className || ''}`}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre
      className={`mb-6 overflow-x-auto rounded-xl bg-gray-900 p-4 text-gray-100 dark:bg-gray-800 ${className || ''}`}
      {...props}
    />
  ),
  img: ({ className, alt, src, ...props }: ImageProps) => (
    <img
      src={src}
      alt={alt || ''}
      className={`my-8 h-auto w-full rounded-lg shadow-md ${className || ''}`}
      loading="lazy"
      {...props}
    />
  ),
  hr: ({ className, ...props }: ComponentPropsWithoutRef<'hr'>) => (
    <hr className={`my-8 border-gray-200 dark:border-gray-800 ${className || ''}`} {...props} />
  ),
  table: ({ className, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-8 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <table className={`w-full text-left text-sm ${className || ''}`} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th
      className={`border-b border-gray-200 bg-gray-50 px-6 py-3 font-semibold text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 ${className || ''}`}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td
      className={`border-b border-gray-100 px-6 py-3 text-gray-700 dark:border-gray-800 dark:text-gray-300 ${className || ''}`}
      {...props}
    />
  ),
}
