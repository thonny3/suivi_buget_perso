"use client"
import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import frTranslations from '../i18n/locales/fr.json'
import mgTranslations from '../i18n/locales/mg.json'
import enTranslations from '../i18n/locales/en.json'

const LanguageContext = createContext()

const SUPPORTED_LANGUAGES = ['fr', 'mg', 'en']
const translationMap = {
  fr: frTranslations,
  mg: mgTranslations,
  en: enTranslations
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const params = useParams()
  const router = useRouter()
  const [currentLanguage, setCurrentLanguage] = useState('fr')
  const [translations, setTranslations] = useState(() => translationMap.fr)

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  useEffect(() => {
    // Utiliser la locale de l'URL si disponible
    const locale = params?.locale
    if (locale && SUPPORTED_LANGUAGES.includes(locale)) {
      setCurrentLanguage(locale)
    } else {
      // Fallback vers la langue sauvegardée ou français
      try {
        const savedLanguage = localStorage.getItem('language')
        if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage)
        }
      } catch (_e) {
        // Ignorer si localStorage n'est pas accessible
      }
    }
  }, [params?.locale])

  useEffect(() => {
    const nextTranslations = translationMap[currentLanguage] || translationMap.fr
    setTranslations(nextTranslations)
    try {
      localStorage.setItem('language', currentLanguage)
    } catch (_e) {
      // Ignorer si localStorage n'est pas accessible
    }
  }, [currentLanguage])

  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES.includes(languageCode)) {
      setCurrentLanguage(languageCode)
      // Rediriger vers la nouvelle langue en conservant la section (#hash) et les paramètres (?search)
      const { pathname, search, hash } = window.location
      const hasLocalePrefix = /^\/[a-z]{2}\b/.test(pathname)
      const basePath = hasLocalePrefix
        ? pathname.replace(/^\/[a-z]{2}\b/, `/${languageCode}`)
        : `/${languageCode}${pathname}`
      const target = `${basePath}${search}${hash}`
      router.push(target)
    }
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Retourner la clé si la traduction n'est pas trouvée
      }
    }
    
    return value || key
  }

  const value = {
    currentLanguage,
    changeLanguage,
    languages,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
