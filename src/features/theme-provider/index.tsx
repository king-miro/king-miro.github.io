'use client'
import React, { PropsWithChildren } from 'react'
import { ThemeProvider } from 'next-themes'

export default function DarkThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  return <ThemeProvider attribute={'class'}>{children}</ThemeProvider>
}
