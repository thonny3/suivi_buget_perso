"use client"
import React, { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSelector from '@/components/LanguageSelector'
import {
  Bell,
  Search,
  User,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  MessageSquare,
  HelpCircle,
  LogOut
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { colors } from '@/styles/colors'

const DashboardNavbar = () => {
  const { user, logout } = useAuth()
  
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const notifications = [
    {
      id: 1,
      title: t('dashboard.notifications.newPayment'),
      message: '250,000 Ar de Rakoto Jean',
      time: '2 min',
      unread: true
    },
    {
      id: 2,
      title: t('dashboard.notifications.budgetWarning'),
      message: 'Votre budget alimentaire est à 90%',
      time: '1h',
      unread: true
    },
    {
      id: 3,
      title: t('dashboard.notifications.goalAchieved'),
      message: 'Félicitations ! Objectif épargne réalisé',
      time: '2h',
      unread: false
    }
  ]

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    console.log('Recherche:', e.target.value)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    setShowUserMenu(false)
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
    setShowNotifications(false)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    console.log('Mode sombre:', !isDarkMode)
  }

  const handleLogout = () => {
    if (session) {
      signOut({ callbackUrl: '/connexion' })
    } else {
      logout()
    }
    setShowUserMenu(false)
  }

  // Obtenir le nom d'utilisateur depuis les données d'authentification
  const userName = user?.fullName || user?.email || 'Utilisateur'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">

        {/* Section gauche - Titre et recherche */}
        <div className="flex items-center space-x-6">
          {/* Bouton menu mobile */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Titre de la page */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h1>
            <p className="text-sm text-gray-500">{t('dashboard.welcome')} {userName}, {t('dashboard.welcomeBack')}</p>
          </div>
        </div>

        {/* Section centre - Barre de recherche */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t('dashboard.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none hover:border-green-300"
            />
          </div>
        </div>

        {/* Section droite - Actions */}
        <div className="flex items-center space-x-3">

          {/* Bouton recherche mobile */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Sélecteur de langue */}
          <LanguageSelector />

          {/* Toggle mode sombre */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 group-hover:text-yellow-600" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group relative"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
              {/* Badge de notification */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">2</span>
              </span>
            </button>

            {/* Dropdown notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">{t('common.notifications')}</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm">{notif.title}</h4>
                          <p className="text-gray-600 text-xs mt-1">{notif.message}</p>
                          <p className="text-gray-400 text-xs mt-2">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button className="w-full text-center text-green-600 hover:text-green-700 font-medium text-sm py-2 hover:bg-green-50 rounded-lg transition-colors">
                    {t('dashboard.notifications.viewAll')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
            <MessageSquare className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
          </button>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.secondary }}>
                <span className="text-white font-medium text-sm">{userInitial}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700 group-hover:text-green-700">{userName}</p>
                <p className="text-xs text-gray-500">Utilisateur</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
            </button>

            {/* Dropdown menu utilisateur */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{t('common.profile')}</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{t('common.settings')}</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left">
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{t('common.help')}</span>
                  </button>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-left group"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 group-hover:text-red-700">{t('common.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre de recherche mobile */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder={t('dashboard.searchMobile')}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
          />
        </div>
      </div>
    </header>
  )
}

export default DashboardNavbar