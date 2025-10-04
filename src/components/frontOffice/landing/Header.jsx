"use client"
import { PieChart, User } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { useRouter } from 'next/navigation'
import React from 'react'
import { colors } from '@/styles/colors'

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
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="rounded-xl p-2 shadow-lg" style={{ backgroundColor: colors.secondary }}>
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold" style={{ color: colors.secondary }}>
              {t('header.title')}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sélecteur de langue */}
            <LanguageSelector />
            
            {isAuthenticated() ? (
              <>
                <button
                  onClick={onDashboard}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                >
                  <User className="w-4 h-4" />
                  <span>{t('common.dashboard')}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: colors.error }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.error}
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="text-green-600 hover:text-green-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-green-50"
                >
                  {t('common.login')}
                </button>
                <button
                  onClick={onGetStarted}
                  className="text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {t('common.getStarted')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
