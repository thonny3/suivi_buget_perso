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
import { colors } from '@/styles/colors'

export default function Dashboard({ params }) {
  const { locale } = params

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
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Revenus du mois',
      value: '3,200 €',
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Dépenses du mois',
      value: '1,850 €',
      change: '-5.1%',
      changeType: 'negative',
      icon: TrendingDown,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Objectifs atteints',
      value: '3/5',
      change: '+2 ce mois',
      changeType: 'positive',
      icon: Target,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue dans votre espace de gestion financière</p>
      </div>

      {/* Cartes de statistiques */}
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
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
            <h3 className="text-lg font-semibold text-gray-900">Dépenses par catégorie</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
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
            {monthlyBudget.map((item, index) => {
              const percentage = (item.spent / item.budget) * 100
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-500">{item.spent}€ / {item.budget}€</span>
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
            {[
              { name: 'Salaire', amount: '+2,500 €', type: 'income', date: 'Aujourd\'hui' },
              { name: 'Courses', amount: '-85 €', type: 'expense', date: 'Hier' },
              { name: 'Restaurant', amount: '-45 €', type: 'expense', date: 'Hier' },
              { name: 'Transport', amount: '-25 €', type: 'expense', date: 'Il y a 2 jours' }
            ].map((transaction, index) => (
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
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount}
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
