"use client"
import { PieChart, User, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { colors } from '@/styles/colors'
import logo from '@/image/logo.png'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const router = useRouter()
  const locale = currentLanguage
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
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
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutModal(false)
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
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

      {/* Modal de confirmation de déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('common.confirmLogout')}
                </h3>
              </div>
              <button
                onClick={cancelLogout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('common.logoutMessage')}
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
              >
                {t('common.logoutCancel')}
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors font-medium"
              >
                {t('common.logoutConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
