"use client"
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown } from 'lucide-react'

const FLAG_BASE_CLASS =
  'w-5 h-4 inline-flex items-center justify-center rounded-sm shadow-sm ring-1 ring-black/5 overflow-hidden bg-white'

const FlagIcon = ({ code, className = '' }) => {
  const renderFlag = () => {
    switch (code) {
      case 'fr':
        return (
          <>
            <rect width="8" height="16" fill="#0055A4" />
            <rect x="8" width="8" height="16" fill="#FFFFFF" />
            <rect x="16" width="8" height="16" fill="#EF4135" />
          </>
        )
      case 'mg':
        return (
          <>
            <rect width="8" height="16" fill="#FFFFFF" />
            <rect x="8" width="16" height="8" fill="#EF4135" />
            <rect x="8" y="8" width="16" height="8" fill="#007E3A" />
          </>
        )
      case 'en':
      case 'us':
        return (
          <>
            <rect width="24" height="16" fill="#B31942" />
            <rect y="2" width="24" height="2" fill="#FFFFFF" />
            <rect y="6" width="24" height="2" fill="#FFFFFF" />
            <rect y="10" width="24" height="2" fill="#FFFFFF" />
            <rect y="14" width="24" height="2" fill="#FFFFFF" />
            <rect width="10" height="8" fill="#0A3161" />
            <g fill="#FFFFFF">
              <circle cx="1.5" cy="1.5" r="0.5" />
              <circle cx="3.5" cy="1.5" r="0.5" />
              <circle cx="5.5" cy="1.5" r="0.5" />
              <circle cx="7.5" cy="1.5" r="0.5" />
              <circle cx="1.5" cy="3.5" r="0.5" />
              <circle cx="3.5" cy="3.5" r="0.5" />
              <circle cx="5.5" cy="3.5" r="0.5" />
              <circle cx="7.5" cy="3.5" r="0.5" />
              <circle cx="2.5" cy="2.5" r="0.5" />
              <circle cx="4.5" cy="2.5" r="0.5" />
              <circle cx="6.5" cy="2.5" r="0.5" />
              <circle cx="2.5" cy="4.5" r="0.5" />
              <circle cx="4.5" cy="4.5" r="0.5" />
              <circle cx="6.5" cy="4.5" r="0.5" />
            </g>
          </>
        )
      default:
        return <rect width="24" height="16" fill="#E5E7EB" />
    }
  }

  return (
    <svg
      viewBox="0 0 24 16"
      className={`${FLAG_BASE_CLASS} ${className}`}
      role="img"
      aria-label={`Flag ${code || 'unknown'}`}
      focusable="false"
    >
      {renderFlag()}
    </svg>
  )
}

export default function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentLang ? (
          <FlagIcon code={currentLang.code} className="w-6 h-4" />
        ) : (
          <span className="text-sm font-medium text-gray-500">--</span>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-green-700">
          {currentLang?.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2" role="listbox">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                  currentLanguage === language.code
                    ? 'bg-green-50 text-green-700'
                    : 'hover:bg-gray-50 hover:text-gray-700'
                }`}
                role="option"
                aria-selected={currentLanguage === language.code}
              >
                <FlagIcon code={language.code} className="w-6 h-4" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{language.name}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600">
                    {language.code.toUpperCase()}
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
