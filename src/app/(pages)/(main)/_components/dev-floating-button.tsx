'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PenLine, FileEdit } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DevFloatingButton() {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Hydration mismatch 방지 및 개발 환경 체크
  if (!isMounted || process.env.NODE_ENV !== 'development') {
    return null
  }

  // 상세 페이지인지 확인 (루트가 아니고, /editor로 시작하지 않음)
  const isDetailPage = pathname !== '/' && !pathname.startsWith('/editor')
  const currentSlug = isDetailPage ? pathname.split('/').pop() : null

  if (isDetailPage && currentSlug) {
    return (
      <Link
        href={`/editor/${currentSlug}`}
        className="fixed right-8 bottom-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-blue-700 active:scale-95"
        title="게시글 수정하기"
      >
        <FileEdit size={24} />
      </Link>
    )
  }

  // 목록 페이지에서는 글쓰기 버튼
  return (
    <Link
      href="/editor"
      className="fixed right-8 bottom-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-700 active:scale-95"
      title="새 글 작성하기"
    >
      <PenLine size={24} />
    </Link>
  )
}
