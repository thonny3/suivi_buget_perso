"use client"
import { LanguageProvider } from '@/context/LanguageContext'
import { DarkModeProvider } from '@/context/DarkModeContext'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LocaleLayout({ children }) {
  const params = useParams()
  const locale = params.locale

  useEffect(() => {
    // Sauvegarder la locale dans localStorage
    if (locale && ['fr', 'mg', 'en'].includes(locale)) {
      localStorage.setItem('language', locale)
    }
  }, [locale])

  return (
    <LanguageProvider>
      <DarkModeProvider>
        {children}
      </DarkModeProvider>
    </LanguageProvider>
  )
}
