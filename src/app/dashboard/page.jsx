"use client"
import React from 'react'
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

export default function Dashboard() {
  // Données simulées pour les graphiques
  const revenueData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Fév', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Avr', revenue: 2780, expenses: 3908 },
    { month: 'Mai', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
    { month: 'Jul', revenue: 3490, expenses: 4300 },
  ]

  const expenseCategories = [
    { name: 'Alimentation', value: 400, color: '#ef4444' },
    { name: 'Transport', value: 300, color: '#f97316' },
    { name: 'Logement', value: 300, color: '#eab308' },
    { name: 'Loisirs', value: 200, color: '#22c55e' },
    { name: 'Santé', value: 150, color: '#3b82f6' },
    { name: 'Autres', value: 100, color: '#a855f7' }
  ]

  const monthlyBudget = [
    { category: 'Alimentation', budget: 500, spent: 420 },
    { category: 'Transport', budget: 200, spent: 180 },
    { category: 'Logement', budget: 800, spent: 800 },
    { category: 'Loisirs', budget: 300, spent: 250 },
  ]

  const statsCards = [
    {
      title: 'Solde Total',
      value: '25,430 €',
      change: '+12.5%',
      changeType: 'positive',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Revenus ce mois',
      value: '8,520 €',
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Dépenses ce mois',
      value: '3,240 €',
      change: '-15.1%',
      changeType: 'negative',
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Épargne',
      value: '12,890 €',
      change: '+5.4%',
      changeType: 'positive',
      icon: PiggyBank,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const recentTransactions = [
    { id: 1, description: 'Salaire - Entreprise XYZ', amount: '+3,500 €', date: '2024-08-10', type: 'income' },
    { id: 2, description: 'Achat Carrefour', amount: '-85.30 €', date: '2024-08-09', type: 'expense' },
    { id: 3, description: 'Virement épargne', amount: '-500 €', date: '2024-08-08', type: 'transfer' },
    { id: 4, description: 'Remboursement santé', amount: '+125.80 €', date: '2024-08-07', type: 'income' },
    { id: 5, description: 'Abonnement Netflix', amount: '-13.49 €', date: '2024-08-06', type: 'expense' },
  ]

  return (
    <div className="h-auto bg-gray-50 p-6 max-h-[700px] overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bonjour, Bienvenue ! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de vos finances aujourd'hui
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{card.value}</h3>
                    <div className="flex items-center mt-2">
                      {card.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ml-1 ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {card.change}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">vs mois dernier</span>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-r ${card.color} rounded-xl p-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Graphique des revenus/dépenses */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenus vs Dépenses</h3>
                <p className="text-gray-600 text-sm">Évolution sur les 7 derniers mois</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Revenus"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Dépenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Répartition des dépenses */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Catégories</h3>
                <p className="text-gray-600 text-sm">Répartition des dépenses</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {expenseCategories.slice(0, 3).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{category.value}€</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section du bas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Budget mensuel */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Budget Mensuel</h3>
                <p className="text-gray-600 text-sm">Suivi des dépenses</p>
              </div>
            </div>
            <div className="space-y-4">
              {monthlyBudget.map((item, index) => {
                const percentage = (item.spent / item.budget) * 100
                const isOverBudget = percentage > 100

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-600">
                        {item.spent}€ / {item.budget}€
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(0)}% utilisé
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Transactions récentes */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
                <p className="text-gray-600 text-sm">Dernières opérations</p>
              </div>
              <button className="text-green-600 text-sm font-medium hover:text-green-700">
                Voir tout
              </button>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'income'
                      ? 'bg-green-100 text-green-600'
                      : transaction.type === 'expense'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                      }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : transaction.type === 'expense' ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'income'
                    ? 'text-green-600'
                    : 'text-red-600'
                    }`}>
                    {transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Objectifs financiers */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Objectif d'épargne 2024</h3>
              <p className="text-green-100 mt-1">Vous êtes sur la bonne voie !</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">12,890€ / 15,000€</p>
              <p className="text-green-100">86% atteint</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-green-400 bg-opacity-30 rounded-full h-3">
              <div className="bg-white h-3 rounded-full" style={{ width: '86%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}