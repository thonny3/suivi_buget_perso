import { NextResponse } from 'next/server'

const locales = ['fr', 'mg', 'en']
const defaultLocale = 'fr'

// Fonction pour obtenir la locale préférée
function getLocale(request) {
  // Vérifier si la locale est dans l'URL
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    // Rediriger vers la locale par défaut
    return defaultLocale
  }

  // Extraire la locale de l'URL
  const locale = pathname.split('/')[1]
  return locales.includes(locale) ? locale : defaultLocale
}

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // Vérifier si le chemin commence par une locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Rediriger s'il n'y a pas de locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    
    // Rediriger vers la page avec la locale
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: [
    // Matcher pour toutes les routes sauf les fichiers statiques et API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
