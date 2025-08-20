"use client"
import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown, Globe } from 'lucide-react'

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
      >
        <Globe className="w-4 h-4 text-gray-600 group-hover:text-green-600" />
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-green-700">
          {currentLang?.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group ${
                  currentLanguage === language.code
                    ? 'bg-green-50 text-green-700'
                    : 'hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <span className="text-xl">{language.flag}</span>
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
