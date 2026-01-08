'use client'

import React, { useEffect, useState } from 'react'
import ThemeModeButton from '@/features/theme-toggle'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MENUS } from '@/features/global-header/const'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/lib/tailwindcss'

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
)

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function GlobalHeader(): React.JSX.Element {
  const [scrollPercent, setScrollPercent] = useState<number>(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setScrollPercent(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    return () => {
      setScrollPercent(0)
      setIsMenuOpen(false)
    }
  }, [pathname])

  return (
    <>
      <nav
        className={
          'sticky top-0 right-0 left-0 z-9999 w-full min-w-xs bg-white/70 backdrop-blur-xs dark:bg-neutral-900/70'
        }
      >
        <div className={'flex h-16 items-center justify-between px-6'}>
          <div className={'flex items-center justify-start'}>
            <Link href="/" className={'shrink-0 px-2'}>
              <img src={'/logo.png'} alt={'logo-pdg'} className={'h-6 w-6'} />
            </Link>
            <ul className={'tablet:flex hidden font-medium'}>
              {MENUS.map((menu) => (
                <Link href={menu.path} key={menu.id} scroll={true}>
                  <li
                    className={
                      'flex cursor-pointer items-center justify-center rounded-xl px-5 py-2 transition-all duration-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }
                  >
                    <span
                      className={pathname === menu.path ? `text-blue-600 dark:text-blue-400` : ''}
                    >
                      {menu.title}
                    </span>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeModeButton />
            <button onClick={() => setIsMenuOpen(true)} className="tablet:hidden">
              <HamburgerIcon />
            </button>
          </div>
        </div>
        <div
          className={cn(
            scrollPercent === 0 ? 'opacity-0' : '',
            'absolute bottom-0 left-0 w-full bg-gray-200 transition-opacity duration-300 dark:bg-neutral-600',
          )}
        >
          <div
            className={'h-px bg-sky-400 dark:bg-sky-500'}
            style={{ width: `${scrollPercent}%` }}
          ></div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[10000] bg-white dark:bg-neutral-900"
          >
            <div className="flex h-16 items-center justify-between px-6">
              <Link href="/" className={'shrink-0 px-2'}>
                <img src={'/logo.png'} alt={'logo-pdg'} className={'h-6 w-6'} />
              </Link>
              <button onClick={() => setIsMenuOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <ul className="flex flex-col items-center justify-center space-y-8 pt-24 text-2xl">
              {MENUS.map((menu) => (
                <li key={menu.id}>
                  <Link href={menu.path}>
                    <span
                      className={pathname === menu.path ? 'text-blue-600 dark:text-blue-400' : ''}
                    >
                      {menu.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
