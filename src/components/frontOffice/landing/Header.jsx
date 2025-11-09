"use client"
import { PieChart, User } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { useRouter } from 'next/navigation'
import React from 'react'
import { colors } from '@/styles/colors'
import logo from '@/image/logo.png'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const router = useRouter()
  const locale = currentLanguage
  
  const onLogin = () => {
    router.push(`/${locale}/connexion`)
  }

  const onGetStarted = () => {
    router.push(`/${locale}/register`)
  }

  const onDashboard = () => {
    router.push(`/${locale}/dashboard`)
  }

  const onLogout = () => {
    logout()
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center">
            <img src={logo.src} alt="MyJalako" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl md:text-2xl font-bold" style={{ color: colors.secondary }}>
              {t('header.title')}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Sélecteur de langue */}
            <LanguageSelector />
            
            {isAuthenticated() ? (
              <>
                <button
                  onClick={onDashboard}
                  className="flex items-center space-x-1 sm:space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-50 text-xs sm:text-sm"
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t('common.dashboard')}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg text-xs sm:text-sm"
                  style={{ backgroundColor: colors.error }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.error}
                >
                  <span className="hidden sm:inline">{t('common.logout')}</span>
                  <span className="sm:hidden">Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-50 text-xs sm:text-sm"
                >
                  {t('common.login')}
                </button>
                <button
                  onClick={onGetStarted}
                  className="text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg text-xs sm:text-sm"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  <span className="hidden sm:inline">{t('common.getStarted')}</span>
                  <span className="sm:hidden">Start</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
