'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { MDXComponents } from '@/shared/ui/mdx-components'
import { ViewUpdate } from '@codemirror/view'
import { EditorHandle } from './initialized-mdx-editor'

const Editor = dynamic(() => import('./initialized-mdx-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50 text-gray-400">
      Loading Editor...
    </div>
  ),
})

interface Frontmatter {
  title: string
  date: string
  category: string
  tags: string
  excerpt: string
}

const initialFrontmatter: Frontmatter = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  category: '',
  tags: '',
  excerpt: '',
}

interface EditorClientProps {
  initialContent: string
  slug?: string
}

export default function EditorClient({ initialContent, slug }: EditorClientProps) {
  const router = useRouter()
  const editorRef = useRef<EditorHandle>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null) // Ref for scroll sync

  const [markdown, setMarkdown] = useState('')
  const [frontmatter, setFrontmatter] = useState<Frontmatter>(initialFrontmatter)

  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.replace('/')
    }
  }, [router])

  useEffect(() => {
    if (initialContent) {
      parsePostContent(initialContent)
    }
    if (slug) {
      setFileName(`${slug}.mdx`)
    } else {
      setFileName('')
    }
  }, [initialContent, slug])

  const parsePostContent = (text: string) => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    const match = text.match(frontmatterRegex)

    if (match) {
      const yamlContent = match[1]
      const bodyContent = match[2]

      const parsedFrontmatter = { ...initialFrontmatter }

      yamlContent.split('\n').forEach((line) => {
        const [key, ...values] = line.split(':')
        if (key && values.length) {
          const value = values
            .join(':')
            .trim()
            .replace(/^['"](.*)['"]$/, '$1')
          const k = key.trim()

          if (k === 'tags') {
            parsedFrontmatter.tags = value
              .replace(/[\[\]]/g, '')
              .replace(/'/g, '')
              .split(',')
              .map((v) => v.trim())
              .join(', ')
          } else if (Object.keys(parsedFrontmatter).includes(k)) {
            // @ts-ignore
            parsedFrontmatter[k] = value
          }
        }
      })

      setFrontmatter(parsedFrontmatter)
      setMarkdown(bodyContent.trim())
    } else {
      setMarkdown(text)
    }
  }

  const generateFileContent = () => {
    const content = editorRef.current?.getMarkdown() ?? markdown

    const tagsArray = frontmatter.tags
      .split(',')
      .map((t) => `'${t.trim()}'`)
      .join(', ')

    return `---
title: '${frontmatter.title.replace(/'/g, "''")}'
date: '${frontmatter.date}'
category: '${frontmatter.category}'
tags: [${tagsArray}]
excerpt: '${frontmatter.excerpt.replace(/'/g, "''")}'
---

${content}`
  }

  const [postId, setPostId] = useState(slug || '')

  useEffect(() => {
    if (!slug && !postId) {
      // Create Draft
      fetch('/api/editor/init', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPostId(data.draftId)
          }
        })
        .catch((err) => console.error('Failed to init draft', err))
    }
  }, [slug, postId])

  const handleSaveProcess = async (targetName: string) => {
    const fileContent = generateFileContent()

    try {
      const response = await fetch('/api/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: targetName, content: fileContent, currentId: postId }),
      })
      const result = await response.json()

      if (result.success) {
        alert('저장되었습니다!')
        setIsDownloadModalOpen(false)
        if (result.newSlug) {
          // If renamed, update postId or redirect.
          // Redirecting is safer to ensure state consistency.
          window.location.href = `/blog/${result.newSlug}`
        }
      } else {
        alert(`저장 실패: ${result.message}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleMainButton = () => {
    if (slug) {
      setFileName(slug)
    } else if (!fileName && frontmatter.title) {
      setFileName(
        frontmatter.title
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]/g, ''),
      )
    }
    setIsDownloadModalOpen(true)
  }

  const handleModalConfirm = async () => {
    if (!fileName) return

    const isValid = /^[a-z][a-z0-9-]*$/.test(fileName)
    if (!isValid) {
      alert('파일 이름은 영문 소문자로 시작해야 하며, 숫자와 하이픈(-)만 포함할 수 있습니다.')
      return
    }

    // Check existing logic should potentially be aware of folder rename conflicts?
    // For now, check if "targetName" exists.
    // If targetName == currentSlug, it's fine (overwrite self).
    // If targetName != currentSlug, and targetName exists, warn.

    try {
      const checkRes = await fetch(`/api/editor/check?filename=${fileName}.mdx`)
      const { exists } = await checkRes.json()

      const currentSlug = slug || ''

      if (exists) {
        const isOverwritingSelf = currentSlug === fileName

        if (!isOverwritingSelf) {
          if (!confirm('이미 동일한 이름의 파일이 존재합니다. 덮어쓰시겠습니까?')) {
            return
          }
        }
      }
    } catch (error) {
      console.error('Check error:', error)
    }

    handleSaveProcess(fileName + '.mdx')
  }

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('postId', postId)

    try {
      const response = await fetch('/api/editor/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (result.success && result.url) {
        return result.url
      } else {
        alert(result.message || '이미지 업로드에 실패했습니다.')
        return null
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
      return null
    }
  }

  const handleBack = () => {
    const fallbackUrl = slug ? `/blog/${slug}` : '/blog'
    router.replace(fallbackUrl)
  }

  return (
    <div className="flex h-screen flex-row bg-white dark:bg-black">
      {/* Left: Input & Editor Area */}
      <div
        className={`${activeTab === 'edit' ? 'flex' : 'hidden'} tablet:flex tablet:w-1/2 w-full flex-col border-r border-gray-200 dark:border-gray-800`}
      >
        {/* Header (Exit & Title & Mobile Tabs) */}
        <div className="flex shrink-0 items-center justify-between px-8 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">뒤로가기</span>
          </button>

          {/* Mobile Tab Switcher */}
          <div className="tablet:hidden flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('edit')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              에디터
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              미리보기
            </button>
          </div>
        </div>

        {/* Main Inputs */}
        <div className="px-8 pb-4">
          <input
            type="text"
            value={frontmatter.title}
            onChange={(e) => setFrontmatter({ ...frontmatter, title: e.target.value })}
            className="w-full bg-transparent text-4xl font-extrabold text-gray-900 placeholder-gray-300 focus:outline-none dark:text-white dark:placeholder-gray-700"
            placeholder="제목을 입력하세요"
          />
          <div className="mt-4 flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
            <input
              type="text"
              value={frontmatter.tags}
              onChange={(e) => setFrontmatter({ ...frontmatter, tags: e.target.value })}
              className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none dark:text-gray-300 dark:placeholder-gray-600"
              placeholder="태그를 입력하세요 (쉼표로 구분)"
            />
            <input
              type="text"
              value={frontmatter.category}
              onChange={(e) => setFrontmatter({ ...frontmatter, category: e.target.value })}
              className="bg-transparent text-right text-sm text-gray-600 placeholder-gray-400 focus:outline-none dark:text-gray-300 dark:placeholder-gray-600"
              placeholder="카테고리"
            />
          </div>
        </div>

        {/* Editor Area */}
        <div className="editor-scroll-wrapper flex-1 overflow-y-auto px-4">
          <Editor
            markdown={markdown}
            ref={editorRef}
            onChange={(newMarkdown, viewUpdate: ViewUpdate) => {
              setMarkdown(newMarkdown)
              if (viewUpdate && previewContainerRef.current) {
                const state = viewUpdate.state
                const docLength = state.doc.length
                const cursor = state.selection.main.head

                // Cursor is at the end of document (or very close)
                console.log(cursor, docLength - 1)
                if (cursor >= docLength - 1) {
                  previewContainerRef.current.scrollTop = previewContainerRef.current.scrollHeight
                }
              }
            }}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* Bottom Action Bar */}
        <div className="w-full shrink-0 border-t border-gray-100 bg-white px-8 py-4 dark:border-gray-800 dark:bg-black">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">{slug ? '편집 중...' : '새 글 작성 중...'}</div>
            <div className="flex gap-3">
              <button
                onClick={handleMainButton}
                className="rounded-lg bg-green-500 px-6 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-green-600 active:scale-95"
              >
                {slug ? '수정하기' : '출간하기'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Preview Area */}
      <div
        className={`${activeTab === 'preview' ? 'flex' : 'hidden'} tablet:flex tablet:w-1/2 w-full flex-col bg-white dark:bg-black`}
      >
        {/* Mobile Header (Tabs) */}
        <div className="tablet:hidden flex shrink-0 items-center justify-between px-8 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">뒤로가기</span>
          </button>

          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('edit')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              에디터
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              미리보기
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-10 pb-20" ref={previewContainerRef}>
          <div className="container mx-auto max-w-3xl px-4">
            <header className="mb-10 text-center">
              <div className="mb-4 flex justify-center gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {frontmatter.category || 'Uncategorized'}
                </span>
              </div>
              <h1 className="tablet:text-5xl mb-4 text-4xl leading-tight font-extrabold tracking-tight text-gray-900 dark:text-white">
                {frontmatter.title || '제목 없음'}
              </h1>
              <div className="flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
                <time className="text-sm">
                  {frontmatter.date
                    ? new Date(frontmatter.date).toLocaleDateString()
                    : 'Invalid Date'}
                </time>
                {frontmatter.tags && (
                  <div className="flex gap-2">
                    {frontmatter.tags
                      .split(',')
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span key={i} className="text-sm">
                          #{tag.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </header>

            <div className="mx-auto max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  ...(MDXComponents as any),
                  img: (props: any) => {
                    let src = props.src
                    if (src && !src.startsWith('http') && !src.startsWith('/')) {
                      // Relative path: resolve to /posts/[postId]/[src]
                      src = `/posts/${postId}/${src}`
                    }
                    return <img {...props} src={src} alt={props.alt || ''} />
                  },
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">파일 저장</h2>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                파일 이름
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => {
                    let val = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '')
                    val = val.replace(/^[^a-z]+/, '')
                    setFileName(val)
                  }}
                  className="w-full rounded-lg border border-gray-300 p-3 pr-12 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800"
                  placeholder="filename"
                  autoFocus
                />
                <span className="absolute right-4 text-sm font-medium text-gray-400 select-none">
                  .mdx
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                첫 글자는 영문 소문자여야 하며, 이후 숫자와 하이픈(-)만 사용할 수 있습니다.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleModalConfirm}
                disabled={!fileName}
                className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-2 font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={18} />
                {slug ? '수정하기' : '출간하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
