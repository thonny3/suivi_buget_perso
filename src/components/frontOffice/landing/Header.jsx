"use client"
import { PieChart, User } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  
  const onLogin = () => {
    router.push('/connexion')
  }

  const onGetStarted = () => {
    router.push('/register')
  }

  const onDashboard = () => {
    router.push('/dashboard')
  }

  const onLogout = () => {
    logout()
  }

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-green-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-2 shadow-lg">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-lg"
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
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
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
