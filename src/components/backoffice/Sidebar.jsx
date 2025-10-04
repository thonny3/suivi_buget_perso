"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Wallet,
  CreditCard,
  TrendingUp,
  Target,
  PiggyBank,
  Menu,
  X,
  LogOut,
  User,
  RefreshCw,
  Bell
} from 'lucide-react'
import { colors } from '@/styles/colors'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Accueil',
      href: '/dashboard'
    },
    {
      id: 'portefeuille',
      label: 'Portefeuille',
      icon: Wallet,
      description: 'Mon portefeuille',
      href: '/dashboard/portefeuille'
    },
    {
      id: 'depenses',
      label: 'Dépenses',
      icon: CreditCard,
      description: 'Mes dépenses',
      href: '/dashboard/depenses'
    },
    {
      id: 'revenus',
      label: 'Revenus',
      icon: TrendingUp,
      description: 'Mes revenus',
      href: '/dashboard/revenus'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: PiggyBank,
      description: 'Gestion budget',
      href: '/dashboard/budget'
    },
    {
      id: 'objectifs',
      label: 'Objectifs',
      icon: Target,
      description: 'Mes objectifs',
      href: '/dashboard/objectifs'
    },
    {
      id: 'abonnements',
      label: 'Abonnements',
      icon: RefreshCw,
      description: 'Mes abonnements',
      href: '/dashboard/abonnements'
    },
    {
      id: 'alertes',
      label: 'Alertes',
      icon: Bell,
      description: 'Notifications',
      href: '/dashboard/alertes'
    }
  ]

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
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center">
              <div className="rounded-xl w-10 h-10 flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.secondary }}>
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              {isOpen && (
                <div className="ml-3">
                  <h1 className="text-xl font-bold" style={{ color: colors.secondary }}>
                    MyJalako
                  </h1>
                  <p className="text-xs text-gray-500">Dashboard</p>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href ||
                (pathname === '/dashboard' && item.id === 'dashboard') ||
                (pathname.startsWith(item.href) && item.href !== '/dashboard')

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}
                  style={isActive ? { backgroundColor: colors.secondary } : {}}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive
                      ? 'text-white'
                      : 'text-gray-500 group-hover:text-green-600'
                    }`} />
                  {isOpen && (
                    <div className="ml-3 text-left">
                      <div className={`font-medium transition-colors ${isActive
                          ? 'text-white'
                          : 'text-gray-700 group-hover:text-green-700'
                        }`}>
                        {item.label}
                      </div>
                      <div className={`text-xs transition-colors ${isActive
                          ? 'text-green-100'
                          : 'text-gray-500 group-hover:text-green-600'
                        }`}>
                        {item.description}
                      </div>
                    </div>
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