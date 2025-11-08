"use client"
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Wallet,
  Calendar,
  MoreHorizontal,
  Users,
  Shield,
  Layers,
  Tag,
  Eye,
  Activity
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { colors } from '@/styles/colors'
import dashboardService from '@/services/dashboardService'
import adminStatsService from '@/services/adminStatsService'
import { useAuth } from '@/app/context/AuthContext'
import AssistantChat from '@/components/AssistantChat'

export default function Dashboard({ params }) {
  const { locale } = params
  const { getCurrentUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    goalsAchieved: 0,
    revenueData: [],
    expenseCategories: [],
    recentTransactions: []
  })
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalCategoriesDepenses: 0,
    totalCategoriesRevenus: 0,
    usersByRole: {},
    recentUsers: [],
    totalCategories: 0,
    totalRevenus: 0,
    totalDepenses: 0,
    totalComptes: 0,
    totalObjectifs: 0,
    userActivationRate: 0,
    platformBalance: 0
  })
  const [userRole, setUserRole] = useState(null)
  const [currencyCode, setCurrencyCode] = useState('EUR')

  const currentMonthLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    } catch {
      return ''
    }
  }, [])

  const currencySymbol = useMemo(() => {
    const code = (currencyCode || '').toString().trim().toUpperCase()
    if (code === 'MGA') return 'Ar'
    if (code === 'EUR') return '€'
    if (code === 'USD') return '$'
    if (code === 'GBP') return '£'
    if (code === 'XOF') return 'CFA'
    return code || '€'
  }, [currencyCode])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setError('')
        setLoading(true)
        
        // Charger les données du dashboard
        const data = await dashboardService.getSummary()
        if (!mounted) return
        setSummary(data || {})
        
        // Vérifier le rôle utilisateur et charger les stats admin si nécessaire
        try {
          const currentUser = await getCurrentUser()
          const role = currentUser?.user?.role
          setUserRole(role)
          
          if (role === 'admin') {
            const adminData = await adminStatsService.getAdminStats()
            if (!mounted) return
            setAdminStats(adminData)
          }
        } catch (e) {
          console.error('Erreur lors de la récupération des données utilisateur:', e)
        }
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Erreur de chargement du tableau de bord')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, []) // Suppression de getCurrentUser des dépendances pour éviter la boucle infinie

  const lastThreeMonthsData = useMemo(() => {
    const data = Array.isArray(summary.revenueData) ? summary.revenueData : []
    // Build a set of the last 3 months in YYYY-MM
    const now = new Date()
    const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const months = [0, 1, 2].map((i) => {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1)
      return ym(dt)
    })
    const last3 = new Set(months)
    // Filter, sort ascending by month, and add a pretty label
    const filtered = data
      .filter((d) => d && typeof d.month === 'string' && last3.has(d.month))
      .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0))
      .map((d) => {
        const [yearStr, monthStr] = d.month.split('-')
        const m = Number(monthStr) - 1
        const y = Number(yearStr)
        const label = new Date(y, m, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
        return { ...d, label }
      })
    return filtered
  }, [summary.revenueData])

  // Charger la devise utilisateur depuis localStorage (même logique que d'autres pages)
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user')
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser)
          const code = (user?.devise || '').toString().trim().toUpperCase()
          if (code) {
            setCurrencyCode(code)
            return
          }
        } catch {}
      }
      const stored = localStorage.getItem('devise') || localStorage.getItem('currency') || localStorage.getItem('currencyCode')
      if (stored && typeof stored === 'string') {
        setCurrencyCode(stored.toUpperCase())
      }
    } catch {}
  }, [])

  const statsCards = useMemo(() => ([
    {
      title: 'Solde Total',
      value: `${Number(summary.totalBalance || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      change: '',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Revenus du mois',
      value: `${Number(summary.monthlyIncome || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      change: '',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Dépenses du mois',
      value: `${Number(summary.monthlyExpenses || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      change: '',
      changeType: 'negative',
      icon: TrendingDown,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Objectifs atteints',
      value: `${Number(summary.goalsAchieved || 0)}`,
      change: '',
      changeType: 'positive',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ]), [summary.totalBalance, summary.monthlyIncome, summary.monthlyExpenses, summary.goalsAchieved, currencySymbol])

  const adminStatsCards = useMemo(() => ([
    {
      title: 'Total Utilisateurs',
      value: `${adminStats.totalUsers}`,
      subtitle: `${adminStats.activeUsers} actifs`,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Catégories Dépenses',
      value: `${adminStats.totalCategoriesDepenses}`,
      subtitle: 'Catégories disponibles',
      icon: Layers,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Catégories Revenus',
      value: `${adminStats.totalCategoriesRevenus}`,
      subtitle: 'Catégories disponibles',
      icon: Tag,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Catégories',
      value: `${adminStats.totalCategories}`,
      subtitle: 'Toutes catégories',
      icon: Activity,
      color: 'from-purple-500 to-purple-600'
    }
  ]), [adminStats.totalUsers, adminStats.activeUsers, adminStats.totalCategoriesDepenses, adminStats.totalCategoriesRevenus, adminStats.totalCategories])

  const adminPlatformCards = useMemo(() => ([
    {
      title: 'Total Revenus',
      value: `${Number(adminStats.totalRevenus || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      subtitle: 'Tous utilisateurs',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Dépenses',
      value: `${Number(adminStats.totalDepenses || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      subtitle: 'Tous utilisateurs',
      icon: TrendingDown,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Total Comptes',
      value: `${adminStats.totalComptes}`,
      subtitle: 'Comptes créés',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Objectifs',
      value: `${adminStats.totalObjectifs}`,
      subtitle: 'Objectifs définis',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ]), [adminStats.totalRevenus, adminStats.totalDepenses, adminStats.totalComptes, adminStats.totalObjectifs, currencySymbol])

  const expenseCategoryLegend = useMemo(() => {
    const items = Array.isArray(summary.expenseCategories) ? summary.expenseCategories : []
    const total = items.reduce((acc, it) => acc + Number(it?.value || 0), 0)
    return items.map((it) => {
      const value = Number(it?.value || 0)
      const pct = total > 0 ? Math.round((value / total) * 100) : 0
      return {
        name: it?.name || 'Autres',
        color: it?.color || '#999',
        value,
        percent: pct
      }
    })
  }, [summary.expenseCategories])

  // Fonctions de navigation optimisées avec useCallback
  const navigateToUsers = useCallback(() => {
    window.location.href = `/${locale}/dashboard/admin/users`
  }, [locale])

  const navigateToExpenseCategories = useCallback(() => {
    window.location.href = `/${locale}/dashboard/admin/categories/depenses`
  }, [locale])

  const navigateToRevenueCategories = useCallback(() => {
    window.location.href = `/${locale}/dashboard/admin/categories/revenus`
  }, [locale])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
          {userRole === 'admin' && (
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          {userRole === 'admin' 
            ? 'Vue d\'ensemble de la plateforme et gestion des utilisateurs' 
            : 'Bienvenue dans votre espace de gestion financière'
          }
        </p>
      </div>

      {/* Cartes de statistiques - Masquées pour les admins */}
      {userRole !== 'admin' && (
        <>
      {loading && (
        <div className="mb-4 text-gray-600">Chargement des données...</div>
      )}
      {error && (
        <div className="mb-4 text-red-600">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
                  <div className="flex items-center">
                    {card.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">vs mois dernier</span>
                  </div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: colors.secondary }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
        </>
      )}

      {/* Section Admin - Affichage conditionnel */}
      {userRole === 'admin' && (
        <>
          {loading && (
            <div className="mb-4 text-gray-600">Chargement des données administrateur...</div>
          )}
          {error && (
            <div className="mb-4 text-red-600">{error}</div>
          )}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Statistiques Administrateur</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {adminStatsCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                        <p className="text-xs text-gray-500">{card.subtitle}</p>
                      </div>
                      <div className={`rounded-xl p-3 bg-gradient-to-r ${card.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cartes de statistiques de plateforme */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Activity className="w-5 h-5 text-emerald-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Statistiques de la Plateforme</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {adminPlatformCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                        <p className="text-xs text-gray-500">{card.subtitle}</p>
                      </div>
                      <div className={`rounded-xl p-3 bg-gradient-to-r ${card.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Graphique des utilisateurs par rôle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Utilisateurs par rôle</h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(adminStats.usersByRole).map(([role, count]) => ({
                        name: role === 'admin' ? 'Administrateurs' : 'Utilisateurs',
                        value: count,
                        color: role === 'admin' ? '#EF4444' : '#3B82F6'
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(adminStats.usersByRole).map(([role, count], index) => (
                        <Cell key={`cell-${index}`} fill={role === 'admin' ? '#EF4444' : '#3B82F6'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Utilisateurs récents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Utilisateurs récents</h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                {adminStats.recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {user.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-red-600" />
                        ) : (
                          <Users className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.nom || user.prenom ? `${user.nom || ''} ${user.prenom || ''}`.trim() : user.email}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
                {adminStats.recentUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Aucun utilisateur récent</div>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques supplémentaires pour admin */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Résumé des utilisateurs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Résumé Utilisateurs</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold text-gray-900">{adminStats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actifs</span>
                  <span className="font-semibold text-green-600">{adminStats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inactifs</span>
                  <span className="font-semibold text-red-600">{adminStats.inactiveUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${adminStats.totalUsers > 0 ? (adminStats.activeUsers / adminStats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {adminStats.totalUsers > 0 ? Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100) : 0}% d'utilisateurs actifs
                </p>
              </div>
            </div>

            {/* Résumé des catégories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Résumé Catégories</h3>
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold text-gray-900">{adminStats.totalCategories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dépenses</span>
                  <span className="font-semibold text-red-600">{adminStats.totalCategoriesDepenses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenus</span>
                  <span className="font-semibold text-green-600">{adminStats.totalCategoriesRevenus}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${adminStats.totalCategories > 0 ? (adminStats.totalCategoriesDepenses / adminStats.totalCategories) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {adminStats.totalCategories > 0 ? Math.round((adminStats.totalCategoriesDepenses / adminStats.totalCategories) * 100) : 0}% catégories dépenses
                </p>
              </div>
            </div>

            {/* Solde global de la plateforme */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Solde Global</h3>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Revenus totaux</span>
                  <span className="font-semibold text-green-600">
                    {Number(adminStats.totalRevenus || 0).toLocaleString('fr-FR')} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dépenses totales</span>
                  <span className="font-semibold text-red-600">
                    {Number(adminStats.totalDepenses || 0).toLocaleString('fr-FR')} {currencySymbol}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Solde net</span>
                    <span className={`font-bold text-lg ${
                      adminStats.platformBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Number(adminStats.platformBalance || 0).toLocaleString('fr-FR')} {currencySymbol}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${
                      adminStats.platformBalance >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.abs(adminStats.platformBalance || 0) / Math.max(adminStats.totalRevenus || 1, 1) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {adminStats.platformBalance >= 0 ? 'Excédent' : 'Déficit'} de la plateforme
                </p>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <button 
                  onClick={navigateToUsers}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Gérer les utilisateurs</span>
                  </div>
                </button>
                <button 
                  onClick={navigateToExpenseCategories}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Layers className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Catégories dépenses</span>
                  </div>
                </button>
                <button 
                  onClick={navigateToRevenueCategories}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Catégories revenus</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Graphiques - Masqués pour les admins */}
      {userRole !== 'admin' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique des revenus et dépenses */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenus vs Dépenses</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lastThreeMonthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  const formattedValue = Number(value || 0).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                  return [`${formattedValue} ${currencySymbol}`, name === 'revenue' ? 'Revenus' : 'Dépenses']
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Revenus"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Dépenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique des catégories de dépenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dépenses par catégorie — {currentMonthLabel}</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.expenseCategories || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(summary.expenseCategories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Légende personnalisée pour afficher aussi les catégories à 0% */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {expenseCategoryLegend.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: item.color }}></span>
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="text-gray-500">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

 
      {/* Budget mensuel - Masqué pour les admins */}
      {userRole !== 'admin' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Budget mensuel</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-4">
            {(summary.expenseCategories || []).slice(0,4).map((item, index) => {
              const budget = 100
              const spent = item.value || 0
              const percentage = (spent / budget) * 100
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm text-gray-500">{spent.toLocaleString('fr-FR')}{` ${currencySymbol}`} / {budget}{` ${currencySymbol}`}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        percentage > 100 ? 'bg-red-500' : 
                        percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions récentes</h3>
          <div className="space-y-3">
            {(summary.recentTransactions || []).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.name}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {`${transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount || 0).toLocaleString('fr-FR')} ${currencySymbol}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Objectifs financiers - Masqué pour les admins */}
      {userRole !== 'admin' && (
      <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: colors.secondary }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Objectif d'épargne 2024</h3>
            <p className="text-green-100 mt-1">Vous êtes sur la bonne voie !</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">8,500 €</p>
            <p className="text-sm text-green-100">sur 12,000 €</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-green-200 bg-opacity-30 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full" 
              style={{ width: '70%' }}
            ></div>
          </div>
          <p className="text-sm text-green-100 mt-2">70% de votre objectif atteint</p>
        </div>
      </div>
      )}
    </div>
  )
}
