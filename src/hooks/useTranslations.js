"use client"
import { useLanguage } from '@/context/LanguageContext'

export const useTranslations = () => {
  const { t, currentLanguage, changeLanguage, languages } = useLanguage()

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage)
  }

  const isCurrentLanguage = (languageCode) => {
    return currentLanguage === languageCode
  }

  return {
    t,
    currentLanguage,
    changeLanguage,
    languages,
    getCurrentLanguage,
    isCurrentLanguage
  }
}
