import React from 'react'
import type { Metadata, Viewport } from 'next'
import '@/shared/styles/globals.css'
import localFont from 'next/font/local'
import DarkThemeProvider from '@/features/theme-provider'

const rootFont = localFont({
  src: '../shared/fonts/Pretendard/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
})

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Playground',
  },
  description: '일 잘하고 싶은 개발자의 개인 공간',
  keywords: ['developer', 'frontend', 'dev', 'portfolio', 'resume'],
  authors: [{ name: 'PDG' }],
  creator: 'PDG',
  publisher: 'PDG',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: {
      template: '%s',
      default: 'Playground',
    },
    description: '일 잘하고 싶은 개발자의 개인 공간',
    type: 'website',
    url: 'https://dogeol.github.io',
    siteName: 'Playground',
    locale: 'en_US',
    images: [
      {
        url: 'https://dogeol.github.io/logo.png',
        width: 489,
        height: 489,
        alt: 'PDG Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s',
      default: 'Playground',
    },
    description: '일 잘하고 싶은 개발자의 개인 공간',
    images: ['https://dogeol.github.io/logo.png'],
    creator: '@PDG',
  },
  alternates: {
    canonical: 'https://dogeol.github.io',
  },
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${rootFont.className} text-gray-700 dark:bg-neutral-900 dark:text-gray-300`}
      >
        <DarkThemeProvider>
          {/*<GlobalHeader />*/}
          {children}
        </DarkThemeProvider>
      </body>
    </html>
  )
}
