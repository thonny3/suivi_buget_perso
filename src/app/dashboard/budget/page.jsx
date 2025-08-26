"use client"
import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Calculator,
  Calendar,
  Target,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import { categorieDepense } from '../../../../services/categorieService'
import { add, getAll } from '../../../../services/bugetService'
import { toast } from 'react-toastify'
import { useAuth } from '@/app/context/AuthContext'

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const {user} = useAuth()

  // État pour le filtre par mois/année
  const [selectedMonth, setSelectedMonth] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCategorie = async () => {
    categorieDepense().then((res) => {
      setCategories(res)
    }).catch((err) => {
      console.error("Erreur lors de la récupération des catégories de dépenses :", err);
    })
  }

  const fetchBuget = async () => {
    getAll().then((res) => {
      console.log(res);
      setBudgets(res)
    }).catch((err) => {
      console.error("Erreur lors de la récupération des catégories de dépenses :", err);
    })
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  const [formData, setFormData] = useState({
    mois: '',
    montant_max: '',
    id_categories_depenses: ''
  })

  // Fonction pour formater les montants
  const formatAmount = (amount) => {
    // Convertir en nombre et gérer les cas NaN/null/undefined
    const numAmount = Number(amount)
    if (isNaN(numAmount) || amount === null || amount === undefined) {
      return '0.00'
    }
    return numAmount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Fonction pour convertir sécurisément en nombre
  const safeNumber = (value) => {
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  // Fonction pour obtenir le mois actuel au format YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  // Fonction pour formater le mois d'affichage
  const formatMonthDisplay = (monthValue) => {
    if (!monthValue) return 'Tous les mois'
    const [year, month] = monthValue.split('-')
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  // Filtrage des budgets par mois sélectionné
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesMonth = !selectedMonth || budget.mois === selectedMonth
    return matchesSearch && matchesMonth
  })

  // Calculs statistiques basés sur les budgets filtrés (par mois sélectionné)
  const totalBudgetMax = filteredBudgets.reduce((sum, budget) => {
    return sum + safeNumber(budget.montant_max)
  }, 0)
  
  const totalDepense = filteredBudgets.reduce((sum, budget) => {
    return sum + safeNumber(budget.montant_depense)
  }, 0)
  
  const totalRestant = filteredBudgets.reduce((sum, budget) => {
    return sum + safeNumber(budget.montant_restant)
  }, 0)
  
  const budgetsAlertes = filteredBudgets.filter(b => safeNumber(b.pourcentage_utilise) >= 80).length
  
  const moyenneUtilisation = filteredBudgets.length > 0 
    ? filteredBudgets.reduce((sum, b) => sum + safeNumber(b.pourcentage_utilise), 0) / filteredBudgets.length 
    : 0

  // Statistiques globales (tous les budgets confondus) pour comparaison
  const statsGlobales = {
    totalBudgets: budgets.length,
    totalBudgetMax: budgets.reduce((sum, budget) => sum + safeNumber(budget.montant_max), 0),
    totalDepense: budgets.reduce((sum, budget) => sum + safeNumber(budget.montant_depense), 0),
    totalRestant: budgets.reduce((sum, budget) => sum + safeNumber(budget.montant_restant), 0),
    moyenneUtilisation: budgets.length > 0 
      ? budgets.reduce((sum, b) => sum + safeNumber(b.pourcentage_utilise), 0) / budgets.length 
      : 0
  }

  // Calcul du pourcentage global d'utilisation
  const pourcentageGlobal = totalBudgetMax > 0 ? Math.round((totalDepense / totalBudgetMax) * 100) : 0

  // Données pour les graphiques basées sur les budgets filtrés
  const budgetData = filteredBudgets.map(budget => ({
    categorie: budget.categorie || 'Sans nom',
    budget: safeNumber(budget.montant_max),
    depense: safeNumber(budget.montant_depense),
    restant: safeNumber(budget.montant_restant),
    pourcentage: safeNumber(budget.pourcentage_utilise)
  }))

  // Données d'évolution (à adapter selon vos besoins)
  const evolutionData = [
    { mois: 'Oct', budget: 4500, depense: 3800 },
    { mois: 'Nov', budget: 4200, depense: 4100 },
    { mois: 'Déc', budget: 4800, depense: 4200 },
    { mois: formatMonthDisplay(selectedMonth).split(' ')[0].substring(0, 3), budget: totalBudgetMax, depense: totalDepense }
  ]

  const repartitionData = filteredBudgets
    .filter(budget => safeNumber(budget.montant_depense) > 0)
    .map(budget => ({
      name: budget.categorie || 'Sans nom',
      value: safeNumber(budget.montant_depense),
      color: categories.find(cat => cat.id === budget.id_categories_depenses)?.couleur || '#6B7280'
    }))

  // Obtenir la liste des mois disponibles dans les budgets
  const availableMonths = [...new Set(budgets.map(budget => budget.mois).filter(Boolean))].sort()

  const handleSubmit = () => {
    if (!formData.montant_max || !formData.id_categories_depenses || !formData.mois) {
      alert('Veuillez remplir tous les champs')
      return
    }

    const categorie = categories.find(cat => cat.id.toString() === formData.id_categories_depenses)

    if (editingBudget) {
      // Mise à jour
      setBudgets(budgets.map(budget =>
        budget.id_budget === editingBudget.id_budget
          ? {
            ...budget,
            ...formData,
            montant_max: parseFloat(formData.montant_max),
            montant_restant: parseFloat(formData.montant_max) - (budget.montant_depense || 0),
            categorie: categorie?.nom || '',
            pourcentage_utilise: Math.round(((budget.montant_depense || 0) / parseFloat(formData.montant_max)) * 100)
          }
          : budget
      ))
    } else {
      // Création
      const newBudget = {
        ...formData,
        montant_max: parseFloat(formData.montant_max),
        montant_restant: parseFloat(formData.montant_max),
        montant_depense: 0,
        pourcentage_utilise: 0,
        id_categorie_depense: formData.id_categories_depenses
      }
    
      add(newBudget).then((res) => {
        console.log(res.data);
        fetchBuget()
        resetForm()
        toast.success("Budget ajouté avec succès !")
      }).catch((err) => {
        console.error("Erreur lors de l'ajout du budget :", err);
      })
    }
  }

  const resetForm = () => {
    setFormData({
      mois: '',
      montant_max: '',
      id_categories_depenses: ''
    })
    setEditingBudget(null)
    setIsModalOpen(false)
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      mois: budget.mois || '',
      montant_max: (budget.montant_max || 0).toString(),
      id_categories_depenses: (budget.id_categories_depenses || '').toString()
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      setBudgets(budgets.filter(budget => budget.id_budget !== id))
    }
  }

  const getBudgetStatus = (pourcentage) => {
    const pct = safeNumber(pourcentage)
    if (pct >= 100) return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, label: 'Dépassé' }
    if (pct >= 80) return { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle, label: 'Attention' }
    if (pct >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: TrendingUp, label: 'Modéré' }
    return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Sain' }
  }

  const getProgressBarColor = (pourcentage) => {
    const pct = safeNumber(pourcentage)
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-orange-500'
    if (pct >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Initialiser le mois actuel au chargement
  useEffect(() => {
    fetchCategorie()
    fetchBuget()
    // Définir le mois actuel par défaut
    setSelectedMonth(getCurrentMonth())
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Budget</h1>
            <p className="text-gray-600 mt-2">
              Suivez et contrôlez vos dépenses par catégorie - {formatMonthDisplay(selectedMonth)}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau Budget
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Budget Total {selectedMonth ? `(${formatMonthDisplay(selectedMonth)})` : '(Global)'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(totalBudgetMax)} {user?.devise || 'MGA'}
                </p>
                {selectedMonth && statsGlobales.totalBudgets > filteredBudgets.length && (
                  <p className="text-xs text-gray-500 mt-1">
                    Global: {formatAmount(statsGlobales.totalBudgetMax)} {user?.devise || 'MGA'}
                  </p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Dépensé {selectedMonth ? `(${formatMonthDisplay(selectedMonth)})` : '(Global)'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatAmount(totalDepense)} {user?.devise || 'MGA'}
                </p>
                {selectedMonth && statsGlobales.totalBudgets > filteredBudgets.length && (
                  <p className="text-xs text-gray-500 mt-1">
                    Global: {formatAmount(statsGlobales.totalDepense)} {user?.devise || 'MGA'}
                  </p>
                )}
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Restant {selectedMonth ? `(${formatMonthDisplay(selectedMonth)})` : '(Global)'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(totalRestant)} {user?.devise || 'MGA'}
                </p>
                {selectedMonth && statsGlobales.totalBudgets > filteredBudgets.length && (
                  <p className="text-xs text-gray-500 mt-1">
                    Global: {formatAmount(statsGlobales.totalRestant)} {user?.devise || 'MGA'}
                  </p>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <PiggyBank className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budgets en Alerte</p>
                <p className="text-2xl font-bold text-orange-600">{budgetsAlertes}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedMonth ? `sur ${filteredBudgets.length}` : `sur ${budgets.length} total`}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/*<div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisation</p>
                <div className="text-2xl font-bold text-gray-900">{pourcentageGlobal}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  Moy: {moyenneUtilisation.toFixed(0)}% par catégorie
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                pourcentageGlobal >= 80 ? 'bg-red-100' : 
                pourcentageGlobal >= 60 ? 'bg-orange-100' : 
                'bg-green-100'
              }`}>
                <Percent className={`w-6 h-6 ${
                  pourcentageGlobal >= 80 ? 'text-red-600' : 
                  pourcentageGlobal >= 60 ? 'text-orange-600' : 
                  'text-green-600'
                }`} />
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Graphiques */}
      {filteredBudgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Budget vs Dépenses par Catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="categorie" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => formatAmount(value)} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${formatAmount(value)} ${user?.devise || 'MGA'}`, 
                    name === 'budget' ? 'Budget' : 'Dépensé'
                  ]} 
                />
                <Legend />
                <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                <Bar dataKey="depense" fill="#EF4444" name="Dépensé" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Répartition des Dépenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={repartitionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {repartitionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${formatAmount(value)} ${user?.devise || 'MGA'}`, 'Dépensé']} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Évolution Budget */}
      {filteredBudgets.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-4">Évolution Budget vs Dépenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis tickFormatter={(value) => formatAmount(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  `${formatAmount(value)} ${user?.devise || 'MGA'}`, 
                  name === 'budget' ? 'Budget' : 'Dépenses'
                ]} 
              />
              <Legend />
              <Line type="monotone" dataKey="budget" stroke="#3B82F6" strokeWidth={3} name="Budget" />
              <Line type="monotone" dataKey="depense" stroke="#EF4444" strokeWidth={3} name="Dépenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par catégorie..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Tous les mois</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthDisplay(month)}
                </option>
              ))}
            </select>
          </div>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Liste des Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map((budget) => {
          const status = getBudgetStatus(budget.pourcentage_utilise)
          const StatusIcon = status.icon

          return (
            <div key={budget.id_budget} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">{budget.categorie || 'Sans nom'}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id_budget)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium">
                    {formatAmount(budget.montant_max)} {user?.devise || 'MGA'}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dépensé</span>
                  <span className="font-medium text-red-600">
                    {formatAmount(budget.montant_depense)} {user?.devise || 'MGA'}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restant</span>
                  <span className="font-medium text-green-600">
                    {formatAmount(budget.montant_restant)} {user?.devise || 'MGA'}
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Utilisation</span>
                    <span className="text-sm font-medium">{safeNumber(budget.pourcentage_utilise).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(budget.pourcentage_utilise)}`}
                      style={{ width: `${Math.min(safeNumber(budget.pourcentage_utilise), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Statut */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${status.bg} mt-4`}>
                  <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Période: {formatMonthDisplay(budget.mois)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredBudgets.length === 0 && (
        <div className="text-center py-12">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {selectedMonth 
              ? `Aucun budget trouvé pour ${formatMonthDisplay(selectedMonth)}` 
              : 'Aucun budget trouvé'
            }
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingBudget ? 'Modifier le Budget' : 'Nouveau Budget'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période/Mois
                </label>
                <input
                  type="month"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.mois}
                  onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant Maximum ({user?.devise || 'MGA'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.montant_max}
                  onChange={(e) => setFormData({ ...formData, montant_max: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie de Dépense
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.id_categories_depenses}
                  onChange={(e) => setFormData({ ...formData, id_categories_depenses: e.target.value })}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  {editingBudget ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}