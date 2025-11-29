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
import { useLanguage } from '@/context/LanguageContext'

export default function Dashboard({ params }) {
  const { locale } = params
  const { getCurrentUser } = useAuth()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    goalsAchieved: 0,
    revenueData: [],
    expenseCategories: [],
    recentTransactions: [],
    debtOverview: {
      total: 0,
      active: 0,
      overdue: 0,
      completed: 0,
      initialTotal: 0,
      remainingTotal: 0
    },
    subscriptionOverview: {
      total: 0,
      active: 0,
      inactive: 0,
      activeMonthlyCost: 0
    },
    subscriptionFrequency: [],
    budgetOverview: []
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
      const localeMap = { fr: 'fr-FR', en: 'en-US', mg: 'mg-MG' }
      const dateLocale = localeMap[locale] || 'fr-FR'
      return new Date().toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })
    } catch {
      return ''
    }
  }, [locale])

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
        setError(e?.message || t('dashboard.error'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, []) // Suppression de getCurrentUser des dépendances pour éviter la boucle infinie

  const lastSixMonthsData = useMemo(() => {
    const data = Array.isArray(summary.revenueData) ? summary.revenueData : []
    const now = new Date()
    const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    const months = Array.from({ length: 6 }, (_, idx) => {
      const dt = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
      return { date: dt, key: ym(dt) }
    })

    const monthMap = data.reduce((acc, item) => {
      if (item && typeof item.month === 'string') {
        acc[item.month] = item
      }
      return acc
    }, {})

    return months.map(({ date, key }) => {
      const found = monthMap[key] || {}
      const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      return {
        month: key,
        revenue: Number(found.revenue || 0),
        expenses: Number(found.expenses || 0),
        label
      }
    })
  }, [summary.revenueData])

  const formatFrequencyLabel = useCallback((value) => {
    const freq = (value || '').toString().toLowerCase()
    if (freq.includes('mens')) return t('dashboard.insights.frequencyMonthly')
    if (freq.includes('trimes')) return t('dashboard.insights.frequencyQuarterly')
    if (freq.includes('semes') || freq.includes('semester')) return t('dashboard.insights.frequencySemiAnnual')
    if (freq.includes('ann')) return t('dashboard.insights.frequencyYearly')
    return t('dashboard.insights.frequencyOther')
  }, [t])

  const debtPieData = useMemo(() => {
    const stats = summary.debtOverview || {}
    return [
      {
        name: t('dashboard.insights.debtsInitial'),
        value: Number(stats.initialTotal || 0),
        color: '#60a5fa'
      },
      {
        name: t('dashboard.insights.debtsRemaining'),
        value: Number(stats.remainingTotal || 0),
        color: '#f97316'
      }
    ]
  }, [summary.debtOverview, t])

  const debtStatusData = useMemo(() => ({
    active: Number(summary.debtOverview?.active || 0),
    overdue: Number(summary.debtOverview?.overdue || 0),
    completed: Number(summary.debtOverview?.completed || 0)
  }), [summary.debtOverview])

  const subscriptionFrequencyData = useMemo(() => {
    const raw = Array.isArray(summary.subscriptionFrequency) ? summary.subscriptionFrequency : []
    return raw.map((item) => ({
      label: formatFrequencyLabel(item?.name || item?.freq || ''),
      value: Number(item?.value ?? item?.total ?? 0)
    }))
  }, [summary.subscriptionFrequency, formatFrequencyLabel])

  const budgetOverviewData = useMemo(() => {
    const raw = Array.isArray(summary.budgetOverview) ? summary.budgetOverview : []
    return raw.map((item) => {
      const limit = Number(item?.limit ?? item?.montant_max ?? 0)
      const spent = Number(item?.spent ?? item?.montant_depense ?? 0)
      const remaining = Math.max(limit - spent, 0)
      const percent = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0
      const label = item?.month ? `${item?.category || 'Budget'} (${item.month})` : (item?.category || 'Budget')
      return {
        ...item,
        label,
        limit,
        spent,
        remaining,
        percent
      }
    })
  }, [summary.budgetOverview])

  const budgetChartData = useMemo(() => budgetOverviewData.map((item) => ({
    label: item.label,
    spent: item.spent,
    remaining: item.remaining
  })), [budgetOverviewData])

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
      title: t('dashboard.stats.totalBalance'),
      value: `${Number(summary.totalBalance || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      change: '',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t('dashboard.stats.monthlyIncome'),
      value: `${Number(summary.monthlyIncome || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      change: '',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: t('dashboard.stats.monthlyExpenses'),
      value: `${Number(summary.monthlyExpenses || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      change: '',
      changeType: 'negative',
      icon: TrendingDown,
      color: 'from-red-500 to-red-600'
    },
    {
      title: t('dashboard.stats.goalsAchieved'),
      value: `${Number(summary.goalsAchieved || 0)}`,
      change: '',
      changeType: 'positive',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ]), [summary.totalBalance, summary.monthlyIncome, summary.monthlyExpenses, summary.goalsAchieved, currencySymbol, t])

  const adminStatsCards = useMemo(() => ([
    {
      title: t('dashboard.admin.totalUsers'),
      value: `${adminStats.totalUsers}`,
      subtitle: `${adminStats.activeUsers} ${t('dashboard.admin.activeUsers')}`,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t('dashboard.admin.expenseCategories'),
      value: `${adminStats.totalCategoriesDepenses}`,
      subtitle: t('dashboard.admin.categoriesAvailable'),
      icon: Layers,
      color: 'from-red-500 to-red-600'
    },
    {
      title: t('dashboard.admin.revenueCategories'),
      value: `${adminStats.totalCategoriesRevenus}`,
      subtitle: t('dashboard.admin.categoriesAvailable'),
      icon: Tag,
      color: 'from-green-500 to-green-600'
    },
    {
      title: t('dashboard.admin.totalCategories'),
      value: `${adminStats.totalCategories}`,
      subtitle: t('dashboard.admin.allCategories'),
      icon: Activity,
      color: 'from-purple-500 to-purple-600'
    }
  ]), [adminStats.totalUsers, adminStats.activeUsers, adminStats.totalCategoriesDepenses, adminStats.totalCategoriesRevenus, adminStats.totalCategories, t])

  const adminPlatformCards = useMemo(() => ([
    {
      title: t('dashboard.admin.totalRevenues'),
      value: `${Number(adminStats.totalRevenus || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      subtitle: t('dashboard.admin.allUsers'),
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: t('dashboard.admin.totalExpenses'),
      value: `${Number(adminStats.totalDepenses || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
      subtitle: t('dashboard.admin.allUsers'),
      icon: TrendingDown,
      color: 'from-red-500 to-red-600'
    },
    {
      title: t('dashboard.admin.totalAccounts'),
      value: `${adminStats.totalComptes}`,
      subtitle: t('dashboard.admin.accountsCreated'),
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t('dashboard.admin.totalGoals'),
      value: `${adminStats.totalObjectifs}`,
      subtitle: t('dashboard.admin.goalsDefined'),
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ]), [adminStats.totalRevenus, adminStats.totalDepenses, adminStats.totalComptes, adminStats.totalObjectifs, currencySymbol, t])

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
    <div className="p-4 sm:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('dashboard.title')}
          {userRole === 'admin' && (
            <span className="ml-2 sm:ml-3 inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </span>
          )}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          {userRole === 'admin' 
            ? t('dashboard.adminSubtitle')
            : t('dashboard.subtitle')
          }
        </p>
      </div>

      {/* Cartes de statistiques - Masquées pour les admins */}
      {userRole !== 'admin' && (
        <>
      {loading && (
        <div className="mb-4 text-gray-600 dark:text-gray-400">{t('dashboard.loading')}</div>
      )}
      {error && (
        <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                 
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words break-all leading-tight">{card.value}</p>
                  <div className="flex items-center flex-wrap gap-1">
                    {card.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${
                      card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('dashboard.stats.vsLastMonth')}</span>
                  </div>
                </div>
                <div className="rounded-xl p-3 flex-shrink-0" style={{ backgroundColor: colors.secondary }}>
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
            <div className="mb-4 text-gray-600 dark:text-gray-400">{t('dashboard.adminLoading')}</div>
          )}
          {error && (
            <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>
          )}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.statsTitle')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {adminStatsCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.platformStatsTitle')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {adminPlatformCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.usersByRole')}</h3>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(adminStats.usersByRole).map(([role, count]) => ({
                        name: role === 'admin' ? t('dashboard.admin.administrators') : t('dashboard.admin.users'),
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.recentUsers')}</h3>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.nom || user.prenom ? `${user.nom || ''} ${user.prenom || ''}`.trim() : user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.actif ? t('dashboard.admin.active') : t('dashboard.admin.inactive')}
                    </span>
                  </div>
                ))}
                {adminStats.recentUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">{t('dashboard.admin.noRecentUsers')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques supplémentaires pour admin */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Résumé des utilisateurs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.usersSummary')}</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.total')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{adminStats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.activeUsers')}</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{adminStats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.inactiveUsers')}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{adminStats.inactiveUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${adminStats.totalUsers > 0 ? (adminStats.activeUsers / adminStats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {adminStats.totalUsers > 0 ? Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100) : 0}% {t('dashboard.admin.activeUsersPercent')}
                </p>
              </div>
            </div>

            {/* Résumé des catégories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.categoriesSummary')}</h3>
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.total')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{adminStats.totalCategories}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.expenses')}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{adminStats.totalCategoriesDepenses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.revenues')}</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{adminStats.totalCategoriesRevenus}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${adminStats.totalCategories > 0 ? (adminStats.totalCategoriesDepenses / adminStats.totalCategories) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {adminStats.totalCategories > 0 ? Math.round((adminStats.totalCategoriesDepenses / adminStats.totalCategories) * 100) : 0}% {t('dashboard.admin.expenseCategoriesPercent')}
                </p>
              </div>
            </div>

            {/* Solde global de la plateforme */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.globalBalance')}</h3>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.totalRevenuesLabel')}</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {Number(adminStats.totalRevenus || 0).toLocaleString('fr-FR')} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.admin.totalExpensesLabel')}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {Number(adminStats.totalDepenses || 0).toLocaleString('fr-FR')} {currencySymbol}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('dashboard.admin.netBalance')}</span>
                    <span className={`font-bold text-lg ${
                      adminStats.platformBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {adminStats.platformBalance >= 0 ? t('dashboard.admin.platformSurplus') : t('dashboard.admin.platformDeficit')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.admin.quickActions')}</h3>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <button 
                  onClick={navigateToUsers}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.admin.manageUsers')}</span>
                  </div>
                </button>
                <button 
                  onClick={navigateToExpenseCategories}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Layers className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.admin.expenseCategoriesLabel')}</span>
                  </div>
                </button>
                <button 
                  onClick={navigateToRevenueCategories}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.admin.revenueCategoriesLabel')}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.revenueVsExpenses')}</h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lastSixMonthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  const formattedValue = Number(value || 0).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                  return [`${formattedValue} ${currencySymbol}`, name === 'revenue' ? t('dashboard.charts.revenues') : t('dashboard.charts.expenses')]
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                name={t('dashboard.charts.revenues')}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                name={t('dashboard.charts.expenses')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique des catégories de dépenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.charts.expensesByCategory')} — {currentMonthLabel}</h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}


      {/* Statistiques dettes / abonnements / budgets */}
      {userRole !== 'admin' && (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Activity className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('dashboard.insights.sectionTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dettes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.insights.debtsTitle')}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('dettes.title')}</span>
            </div>
            {debtPieData.some((d) => d.value > 0) ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={debtPieData}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={80}
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {debtPieData.map((entry, index) => (
                        <Cell key={`debt-pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${Number(value || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
                        name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                {t('dashboard.insights.emptyState')}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.insights.debtsActive')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{debtStatusData.active}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.insights.debtsOverdue')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{debtStatusData.overdue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.insights.debtsCompleted')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{debtStatusData.completed}</p>
              </div>
            </div>
          </div>

          {/* Abonnements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.insights.subscriptionsTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.insights.subscriptionsMonthlyCost')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  {Number(summary.subscriptionOverview?.activeMonthlyCost || 0).toLocaleString('fr-FR')} {currencySymbol}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.insights.subscriptionsActive')} / {t('dashboard.insights.subscriptionsInactive')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{t('dashboard.insights.subscriptionsActive')}</p>
                <p className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">{Number(summary.subscriptionOverview?.active || 0)}</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3">
                <p className="text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400">{t('dashboard.insights.subscriptionsInactive')}</p>
                <p className="text-xl font-semibold text-amber-700 dark:text-amber-300">{Number(summary.subscriptionOverview?.inactive || 0)}</p>
              </div>
            </div>
            {subscriptionFrequencyData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subscriptionFrequencyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `${Number(value || 0).toLocaleString('fr-FR')} ${currencySymbol}`}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                {t('dashboard.insights.emptyState')}
              </div>
            )}
          </div>

          {/* Budgets */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.insights.budgetTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.insights.budgetChartLabel')}</p>
              </div>
            </div>
            {budgetChartData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" hide />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${Number(value || 0).toLocaleString('fr-FR')} ${currencySymbol}`,
                        name === 'spent' ? t('dashboard.insights.budgetSpent') : t('dashboard.insights.budgetRemaining')
                      ]}
                    />
                    <Bar dataKey="spent" stackId="budget" fill="#f97316" name={t('dashboard.insights.budgetSpent')} />
                    <Bar dataKey="remaining" stackId="budget" fill="#22c55e" name={t('dashboard.insights.budgetRemaining')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                {t('dashboard.insights.emptyState')}
              </div>
            )}
            <div className="mt-4 space-y-3">
              {budgetOverviewData.slice(0, 3).map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                    <span>{Math.round(item.percent)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{t('dashboard.insights.budgetSpent')}: {Number(item.spent).toLocaleString('fr-FR')} {currencySymbol}</span>
                    <span>{t('dashboard.insights.budgetRemaining')}: {Number(item.remaining).toLocaleString('fr-FR')} {currencySymbol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

 
      {/* Budget mensuel - Masqué pour les admins */}
      {userRole !== 'admin' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.budget.monthlyBudget')}</h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{spent.toLocaleString('fr-FR')}{` ${currencySymbol}`} / {budget}{` ${currencySymbol}`}</span>
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.budget.recentTransactions')}</h3>
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
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
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
            <h3 className="text-xl font-semibold">{t('dashboard.goals.savingsGoal2024')}</h3>
            <p className="text-green-100 mt-1">{t('dashboard.goals.onTrack')}</p>
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
          <p className="text-sm text-green-100 mt-2">70% {t('dashboard.goals.goalReached')}</p>
        </div>
      </div>
      )}
    </div>
  )
}
