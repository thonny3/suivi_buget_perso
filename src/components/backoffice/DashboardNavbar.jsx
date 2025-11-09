"use client"
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { API_CONFIG } from '@/config/api'
import apiService from '@/services/apiService'
import alertThresholdsService from '@/services/alertThresholdsService'
import { useLanguage } from '@/context/LanguageContext'
import { useSidebar } from '@/context/SidebarContext'
import { useDarkMode } from '@/context/DarkModeContext'
import LanguageSelector from '@/components/LanguageSelector'
import {
  Bell,
  Search,
  User,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  MessageSquare,
  HelpCircle,
  LogOut,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { colors } from '@/styles/colors'
import { io as socketIO } from 'socket.io-client'

const DashboardNavbar = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toggleSidebar, isOpen } = useSidebar()
  
  const { t, currentLanguage } = useLanguage()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const [avatarError, setAvatarError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasComptesAlert, setHasComptesAlert] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const sortAlertsByDate = (list) => {
    return [...list].sort((a, b) => {
      const ad = a?.date_declenchement || a?.date_creation || 0
      const bd = b?.date_declenchement || b?.date_creation || 0
      return new Date(bd).getTime() - new Date(ad).getTime()
    })
  }

  const alertKey = (a) => `${a?.type_alerte || ''}|${a?.message || ''}`

  // Charger les alertes (quasi temps réel via polling)
  useEffect(() => {
    let timer
    let socket
    const load = async () => {
      if (!user?.id_user) return
      try {
        const data = await apiService.request(`/alertes/${user.id_user}`, { method: 'GET' })
        const list = Array.isArray(data) ? data : []
        const sorted = sortAlertsByDate(list)
        setAlerts(sorted)
        setUnreadCount(sorted.filter(a => a.lue === false || a.lue === 0).length)
        setVisibleCount(5)
      } catch (_e) {}
    }
    load()
    timer = setInterval(load, 60000)

    // Socket real-time
    try {
      socket = socketIO(API_CONFIG.BASE_URL.replace('/api', ''), { transports: ['websocket'], autoConnect: true })
      socket.emit('auth:join', user?.id_user)
      socket.on('alert:new', (a) => {
        setAlerts((prev) => {
          const key = alertKey(a)
          if (prev.some(p => alertKey(p) === key)) return prev
          const next = sortAlertsByDate([{ ...a, lue: 0 }, ...prev])
          setUnreadCount((c) => c + 1)
          setVisibleCount((v) => Math.max(5, v))
          return next
        })
      })
    } catch (_e) {}
    return () => { if (timer) clearInterval(timer) }
  }, [user?.id_user])

  // Comparaison locale: somme des comptes vs seuil 'comptes' => notifie dans la navbar
  useEffect(() => {
    const checkComptesThreshold = async () => {
      if (!user?.id_user || hasComptesAlert) return
      try {
        // Récupère le seuil 'comptes'
        const threshold = await alertThresholdsService.getOne(user.id_user, 'comptes')
        const thresholdValue = Number(threshold?.value)
        if (!Number.isFinite(thresholdValue)) return
        // Récupère les comptes et calcule la somme
        const comptes = await apiService.request('/comptes/mycompte/user', { method: 'GET' })
        const totalSolde = Array.isArray(comptes) ? comptes.reduce((s, c) => s + Number(c.solde || 0), 0) : 0
        if (totalSolde <= thresholdValue) {
          const alertItem = {
            id_alerte: `local-comptes-${Date.now()}`,
            id_user: user.id_user,
            type_alerte: 'Alerte seuil comptes',
            message: `Votre somme des comptes (${totalSolde}) est inférieure ou égale au seuil défini (${thresholdValue}).`,
            date_declenchement: new Date().toISOString(),
            lue: 0
          }
          setAlerts((prev) => {
            const key = alertKey(alertItem)
            if (prev.some(p => alertKey(p) === key)) return prev
            const next = sortAlertsByDate([alertItem, ...prev])
            setUnreadCount((c) => c + 1)
            return next
          })
          setHasComptesAlert(true)
        }
      } catch (_e) {
        // ignore
      }
    }
    checkComptesThreshold()
  }, [user?.id_user, hasComptesAlert])

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

  const handleReset = () => {
    setSearchQuery('')
    setShowNotifications(false)
    setShowUserMenu(false)
    setAlerts([])
    setUnreadCount(0)
    setHasComptesAlert(false)
    setVisibleCount(5)
  }

  const markOneAsRead = async (a) => {
    const wasUnread = (a?.lue === false || a?.lue === 0)
    // If we have an id, persist on backend
    if (a?.id_alerte) {
      try { await apiService.request(`/alertes/${a.id_alerte}`, { method: 'PATCH' }) } catch (_e) {}
      setAlerts((prev) => prev.map((it) => it.id_alerte === a.id_alerte ? { ...it, lue: true } : it))
    } else {
      // Fallback: mark locally by key
      const key = alertKey(a)
      setAlerts((prev) => prev.map((it) => (alertKey(it) === key ? { ...it, lue: true } : it)))
    }
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1))
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
    setShowUserMenu(false)
  }

  const confirmLogout = () => {
    logout()
    router.push('/connexion')
    setShowLogoutModal(false)
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  // Obtenir le nom d'utilisateur depuis les données d'authentification
  const userName = user?.fullName || [ user?.nom?.toUpperCase()].filter(Boolean).join(' ') || user?.email || 'Utilisateur'
  const userInitial = (user?.prenom?.[0] || user?.nom?.[0] || userName?.[0] || 'U').toUpperCase()
  const API_ORIGIN = API_CONFIG.BASE_URL.replace(/\/api$/, '')
  const avatarUrl = user?.image && !avatarError ? `${API_ORIGIN}/uploads/${user.image}` : null

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4">

        {/* Section gauche - Logo, nom app et toggle sidebar */}
        <div className="flex items-center space-x-4">
          {/* Toggle Sidebar - Hamburger */}
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title={isOpen ? 'Fermer la sidebar' : 'Ouvrir la sidebar'}
          >
            <div className="flex flex-col space-y-1">
              <div className={`w-5 h-0.5 bg-gray-600 group-hover:bg-gray-800 transition-all duration-200`}></div>
              <div className={`w-5 h-0.5 bg-gray-600 group-hover:bg-gray-800 transition-all duration-200`}></div>
              <div className={`w-5 h-0.5 bg-gray-600 group-hover:bg-gray-800 transition-all duration-200`}></div>
            </div>
          </button>

        </div>

        {/* Section centre - Barre de recherche */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t('dashboard.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none hover:border-green-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Section droite - Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">

          {/* Bouton recherche mobile */}
          <button className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Sélecteur de langue */}
          <LanguageSelector />

          {/* Toggle mode sombre */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
            title={isDarkMode ? t('common.lightMode') : t('common.darkMode')}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-yellow-600" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600" />
            )}
          </button>

          {/* Reset navbar UI state */}
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
            title="Reset"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-green-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-green-600" />
              {/* Badge de notification */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] leading-none text-white font-bold">{unreadCount}</span>
                </span>
              )}
            </button>

            {/* Dropdown notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    {t('common.notifications')}
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {unreadCount}
                    </span>
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar scroll-smooth">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">{t('common.noNotifications') || 'Aucune notification'}</div>
                  ) : (
                    alerts.slice(0, visibleCount).map((a) => (
                      <button key={a.id_alerte || `${a.id_user}-${a.type_alerte}-${a.date_declenchement}`} onClick={() => markOneAsRead(a)} className="w-full text-left p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start space-x-3">
                          {(() => { const isUnread = a.lue === false || a.lue === 0; return (
                            <div className={`w-2 h-2 rounded-full mt-2 ${isUnread ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          )})()}
                          <div className="flex-1">
                            {(() => { const isUnread = a.lue === false || a.lue === 0; return (
                              <div className="flex items-center gap-2">
                                <h4 className={`${isUnread ? 'font-semibold' : 'font-medium'} text-gray-800 dark:text-gray-200 text-sm`}>{a.type_alerte || 'Alerte'}</h4>
                                {isUnread && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold">Non lue</span>
                                )}
                              </div>
                            )})()}
                            <p className={`text-xs mt-1 ${((a.lue === false || a.lue === 0) ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400')}`}>{a.message || ''}</p>
                            {a.date_declenchement && (
                              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">{new Date(a.date_declenchement).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <button
                      onClick={() => setVisibleCount((v) => v + 5)}
                      disabled={visibleCount >= alerts.length}
                      className={`flex-1 text-center font-medium text-sm py-2 rounded-lg transition-colors ${visibleCount >= alerts.length ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 cursor-not-allowed' : 'text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900'}`}
                    >
                      Afficher plus
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (!user?.id_user) return
                          await apiService.request(`/alertes/${user.id_user}/read-all`, { method: 'PATCH' })
                          setAlerts((prev) => prev.map((a) => ({ ...a, lue: true })))
                          setUnreadCount(0)
                          setHasComptesAlert(false)
                        } catch (_e) {}
                      }}
                      className="flex-1 text-center text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Marquer tout comme lu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.secondary }}>
                  <span className="text-white font-medium text-sm">{userInitial}</span>
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.prenom}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-green-600" />
            </button>

            {/* Dropdown menu utilisateur */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left" onClick={() => { router.push(`/${currentLanguage}/dashboard/profil`); setShowUserMenu(false) }}>
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('common.profile')}</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left">
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('common.settings')}</span>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left">
                    <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('common.help')}</span>
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-left group"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400 group-hover:text-red-700">{t('common.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barre de recherche mobile */}
      <div className="md:hidden px-3 sm:px-4 md:px-6 pb-3 md:pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder={t('dashboard.searchMobile')}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
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

export default DashboardNavbar