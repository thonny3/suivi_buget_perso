"use client"
import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const LanguageContext = createContext()

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
  const [translations, setTranslations] = useState({})

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'mg', name: 'Malagasy', flag: '🇲🇬' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]

  useEffect(() => {
    // Utiliser la locale de l'URL si disponible
    const locale = params?.locale
    if (locale && ['fr', 'mg', 'en'].includes(locale)) {
      setCurrentLanguage(locale)
    } else {
      // Fallback vers la langue sauvegardée ou français
      const savedLanguage = localStorage.getItem('language')
      if (savedLanguage && ['fr', 'mg', 'en'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [params?.locale])

  useEffect(() => {
    // Charger les traductions pour la langue actuelle
    const loadTranslations = async () => {
      try {
        const translations = await import(`../i18n/locales/${currentLanguage}.json`)
        setTranslations(translations.default)
        localStorage.setItem('language', currentLanguage)
      } catch (error) {
        console.error(`Erreur lors du chargement des traductions pour ${currentLanguage}:`, error)
        // Fallback vers le français
        setCurrentLanguage('fr')
      }
    }

    loadTranslations()
  }, [currentLanguage])

  const changeLanguage = (languageCode) => {
    if (['fr', 'mg', 'en'].includes(languageCode)) {
      setCurrentLanguage(languageCode)
      // Rediriger vers la nouvelle langue
      const currentPath = window.location.pathname
      const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${languageCode}`)
      router.push(newPath)
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
