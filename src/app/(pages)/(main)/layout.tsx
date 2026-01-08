import type { PropsWithChildren } from 'react'

const Layout = ({ children }: PropsWithChildren) => {
  return <main className="h-full w-full">{children}</main>
}

export default Layout
