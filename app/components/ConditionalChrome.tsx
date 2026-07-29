'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

const EMBED_PATHS = ['/agb-embed', '/datenschutz-embed']

export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEmbed = EMBED_PATHS.includes(pathname)

  if (isEmbed) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </>
  )
}