"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import Logo from '@/components/Logo'
import {
  Home,
  Wallet,
  CreditCard,
  TrendingUp,
  Target,
  PiggyBank,
  LogOut,
  User,
  RefreshCw,
  Bell,
  DollarSign,
  ArrowLeftRight
} from 'lucide-react'
import { colors } from '@/styles/colors'
import { useAuth } from '@/app/context/AuthContext'

const Sidebar = () => {
  const { isOpen } = useSidebar()
  const { user } = useAuth()
  const pathname = usePathname()

  // Préfixe locale à partir de l'URL (ex: /fr/...)
  const currentLocale = (() => {
    const parts = (pathname || '').split('/').filter(Boolean)
    return parts[0]?.length === 2 ? `/${parts[0]}` : ''
  })()

  const withLocale = (path) => `${currentLocale}${path}`

  const baseMenu = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Accueil',
      href: withLocale('/dashboard')
    },
  ]

  const adminMenu = [
    {
      id: 'categories-revenus',
      label: 'Catégories revenus',
      icon: TrendingUp,
      description: 'Gestion des catégories revenus',
      href: withLocale('/dashboard/admin/categories/revenus')
    },
    {
      id: 'categories-depenses',
      label: 'Catégories dépenses',
      icon: CreditCard,
      description: 'Gestion des catégories dépenses',
      href: withLocale('/dashboard/admin/categories/depenses')
    },
    {
      id: 'admin-users',
      label: 'Utilisateurs',
      icon: User,
      description: 'Gestion des utilisateurs',
      href: withLocale('/dashboard/admin/users')
    }
  ]

  const userMenu = [
    {
      id: 'dettes',
      label: 'Dettes',
      icon: DollarSign,
      description: 'Dettes et remboursements',
      href: withLocale('/dashboard/dettes')
    },
    {
      id: 'portefeuille',
      label: 'Portefeuille',
      icon: Wallet,
      description: 'Mon portefeuille',
      href: withLocale('/dashboard/portefeuille')
    },
    {
      id: 'investissements',
      label: 'Investissements',
      icon: TrendingUp,
      description: 'Suivi des investissements',
      href: withLocale('/dashboard/investissement')
    },
    {
      id: 'depenses',
      label: 'Dépenses',
      icon: CreditCard,
      description: 'Mes dépenses',
      href: withLocale('/dashboard/depenses')
    },
    {
      id: 'revenus',
      label: 'Revenus',
      icon: TrendingUp,
      description: 'Mes revenus',
      href: withLocale('/dashboard/revenus')
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ArrowLeftRight,
      description: 'Toutes les transactions',
      href: withLocale('/dashboard/trasactios')
    },
    {
      id: 'transferts',
      label: 'Transferts',
      icon: ArrowLeftRight,
      description: 'Mouvements entre comptes/objectifs',
      href: withLocale('/dashboard/transferts')
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: PiggyBank,
      description: 'Gestion budget',
      href: withLocale('/dashboard/budget')
    },
    {
      id: 'objectifs',
      label: 'Objectifs',
      icon: Target,
      description: 'Mes objectifs',
      href: withLocale('/dashboard/objectifs')
    },
    {
      id: 'abonnements',
      label: 'Abonnements',
      icon: RefreshCw,
      description: 'Mes abonnements',
      href: withLocale('/dashboard/abonnements')
    },
    {
      id: 'alertes',
      label: 'Alertes',
      icon: Bell,
      description: 'Notifications',
      href: withLocale('/dashboard/alertes')
    },
    {
      id: 'ia',
      label: 'Insights IA',
      icon: TrendingUp,
      description: 'Analyse et prévisions',
      href: withLocale('/dashboard/ia')
    }
  ]

  const menuItems = user?.role === 'admin' ? [...baseMenu, ...adminMenu] : [...baseMenu, ...userMenu]

  const handleLogout = () => {
    console.log('Déconnexion...')
    // Logique de déconnexion ici
    // Exemple: router.push('/login')
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ${isOpen ? 'w-72' : 'w-20'} min-h-screen flex flex-col`}>

        {/* Header avec Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link href={withLocale('/dashboard')} className="flex items-center">
              <Logo size="small" />
              {isOpen && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold" style={{ color: colors.secondary }}>
                    MyJalako
                  </h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              )}
            </Link>
            {/* Toggle button removed as requested */}
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === withLocale('/dashboard'))

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative ${isActive ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
                  style={isActive ? { backgroundColor: colors.secondary, borderLeft: `4px solid ${colors.primary}` } : undefined}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = colors.light
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  {isOpen && (
                    <div className="ml-3 text-left">
                      <div className={`font-medium transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {item.label}
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer avec déconnexion */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 group`}
          >
            <LogOut className="w-5 h-5 transition-colors group-hover:text-red-700" />
            {isOpen && (
              <div className="ml-3 text-left">
                <div className="font-medium transition-colors group-hover:text-red-700">
                  Déconnexion
                </div>
                <div className="text-xs text-red-400 transition-colors group-hover:text-red-500">
                  Se déconnecter
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
