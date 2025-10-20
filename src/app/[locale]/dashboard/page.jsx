"use client"
import React, { useEffect, useMemo, useState } from 'react'
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
  MoreHorizontal
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { colors } from '@/styles/colors'
import dashboardService from '@/services/dashboardService'

export default function Dashboard({ params }) {
  const { locale } = params

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
        const data = await dashboardService.getSummary()
        if (!mounted) return
        setSummary(data || {})
      } catch (e) {
        if (!mounted) return
        setError(e?.message || 'Erreur de chargement du tableau de bord')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

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
  ]), [summary])

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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue dans votre espace de gestion financière</p>
      </div>

      {/* Cartes de statistiques */}
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

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique des revenus et dépenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenus vs Dépenses</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lastThreeMonthsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Revenus"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Dépenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
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

      {/* Budget mensuel */}
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

      {/* Objectifs financiers */}
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
    </div>
  )
}
