"use client"
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LocalizedLink({ href, children, ...props }) {
  const params = useParams()
  const locale = params?.locale || 'fr'
  
  // S'assurer que l'URL commence par la locale
  const localizedHref = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`
  
  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  )
}
