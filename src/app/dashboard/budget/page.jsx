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
import { colors } from '@/styles/colors'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import budgetsService from '@/services/budgetsService'
import depensesService from '@/services/depensesService'
import { useToast } from '@/hooks/useToast'

export default function BudgetPage() {
  const { showSuccess, showError } = useToast()
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    mois: '',
    montant_max: '',
    id_categories_depenses: ''
  })
  const [errors, setErrors] = useState({})

  // Charger depuis l'API
  const loadBudgets = async () => {
    try {
      setError('')
      setLoading(true)
      const res = await budgetsService.getBudgets()
      setBudgets(Array.isArray(res) ? res : [])
    } catch (e) {
      const errorMessage = e?.message || 'Erreur lors du chargement des budgets'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await depensesService.getDepenseCategories()
      const normalized = Array.isArray(res) ? res.map((c) => ({
        id: c.id || c.id_categorie_depense || c.id_categorie || c.idCategorie || c.code || `${c.nom || c.name}`,
        nom: c.nom || c.name || c.libelle || c.label || 'Catégorie'
      })) : []
      setCategories(normalized)
    } catch (e) {
      setCategories([])
      showError('Erreur lors du chargement des catégories')
    }
  }

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [])

  // Calculs statistiques
  const totalBudgetMax = budgets.reduce((sum, budget) => sum + (Number(budget.montant_max) || 0), 0)
  const totalDepense = budgets.reduce((sum, budget) => sum + (Number(budget.montant_depense) || 0), 0)
  const totalRestant = budgets.reduce((sum, budget) => sum + (Number(budget.montant_restant) || 0), 0)
  const budgetsAlertes = budgets.filter(b => (Number(b.pourcentage_utilise) || 0) >= 80).length
  const moyenneUtilisation = budgets.length > 0 ? (budgets.reduce((sum, b) => sum + (Number(b.pourcentage_utilise) || 0), 0) / budgets.length) : 0

  // --- Devise & formatage ---
  const getLocalStorageDevise = () => {
    try {
      const val = (typeof window !== 'undefined') ? (localStorage.getItem('devise') || localStorage.getItem('currency') || localStorage.getItem('currencyCode')) : ''
      return (val || '').toString().toUpperCase()
    } catch {
      return ''
    }
  }

  const getDefaultCurrencySymbol = () => {
    const lsCode = getLocalStorageDevise()
    if (lsCode === 'MGA') return 'Ar'
    if (lsCode) return lsCode
    try {
      const user = localStorage.getItem('user')
      const userDevise = user ? (JSON.parse(user)?.devise || '').toString().toUpperCase() : ''
      if (userDevise === 'MGA') return 'Ar'
      return userDevise || '€'
    } catch {
      return '€'
    }
  }

  const formatAmountDefault = (amount) => {
    const lsCode = getLocalStorageDevise()
    const num = Number(amount || 0)
    if (lsCode === 'MGA') {
      const intStr = Math.round(num).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
      return `${intStr} Ar`
    }
    try {
      const user = localStorage.getItem('user')
      const userDevise = user ? (JSON.parse(user)?.devise || '').toString().toUpperCase() : ''
      if (userDevise === 'MGA') {
        const intStr = Math.round(num).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
        return `${intStr} Ar`
      }
    } catch {}
    const symbol = getDefaultCurrencySymbol()
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${symbol}`
  }

  // Helper pour YYYY-MM
  const toYearMonth = (val) => {
    if (!val) return ''
    try {
      // si déjà YYYY-MM
      if (/^\d{4}-\d{2}$/.test(val.toString())) return val.toString()
      const d = new Date(val)
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        return `${y}-${m}`
      }
      return val.toString()
    } catch {
      return val.toString()
    }
  }

  // Filtrage des budgets
  const filteredBudgets = budgets.filter(budget => {
    const categorieName = ((budget.categorie ?? budget.category) || '').toString().toLowerCase()
    const matchesSearch = categorieName.includes((searchTerm || '').toString().toLowerCase())
    const moisValue = toYearMonth((budget.mois ?? budget.month) || '')
    const matchesMonth = !selectedMonth || moisValue === selectedMonth
    return matchesSearch && matchesMonth
  })

  // Données pour les graphiques (filtrées par mois sélectionné)
  const budgetData = filteredBudgets.map(budget => ({
    categorie: budget.categorie,
    budget: Number(budget.montant_max) || 0,
    depense: Number(budget.montant_depense) || 0,
    restant: Number(budget.montant_restant) || 0,
    pourcentage: Number(budget.pourcentage_utilise) || 0
  }))

  // Palette de couleurs pour différencier les catégories dans le camembert
  const PIE_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F43F5E', '#84CC16', '#A855F7', '#14B8A6']

  // Données pour l'évolution mensuelle (comme dans revenus)
  const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  const monthlyTotals = Array.from({ length: 12 }, () => 0)
  budgets.forEach((budget) => {
    try {
      const moisValue = budget.mois || budget.month
      if (moisValue) {
        // Extraire le mois depuis YYYY-MM
        const parts = moisValue.toString().split('-')
        if (parts.length >= 2) {
          const monthIndex = parseInt(parts[1]) - 1 // Mois 1-12 -> index 0-11
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyTotals[monthIndex] += Number(budget.montant_max) || 0
          }
        }
      }
    } catch {}
  })
  const evolutionData = monthLabels.map((label, idx) => ({ month: label, montant: monthlyTotals[idx] }))

  const repartitionData = filteredBudgets.map((budget, idx) => ({
    name: budget.categorie,
    value: Number(budget.montant_depense) || 0,
    color: PIE_COLORS[idx % PIE_COLORS.length]
  }))

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.mois || formData.mois.trim() === '') {
      newErrors.mois = 'La période/mois est requise'
    }
    
    if (!formData.montant_max || formData.montant_max.trim() === '') {
      newErrors.montant_max = 'Le montant maximum est requis'
    } else {
      const montant = parseFloat(formData.montant_max)
      if (isNaN(montant) || montant <= 0) {
        newErrors.montant_max = 'Le montant doit être un nombre positif'
      }
    }
    
    if (!formData.id_categories_depenses || formData.id_categories_depenses === '') {
      newErrors.id_categories_depenses = 'Veuillez sélectionner une catégorie'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    const categorie = categories.find(cat => cat.id.toString() === formData.id_categories_depenses)
    
    try {
      const payload = {
        mois: formData.mois, // attendu au format YYYY-MM
        montant_max: parseFloat(formData.montant_max),
        id_categorie_depense: parseInt(formData.id_categories_depenses),
        categorie: categorie?.nom || undefined,
      }

      if (editingBudget) {
        await budgetsService.updateBudget(editingBudget.id_budget, payload)
        showSuccess('Budget mis à jour avec succès')
      } else {
        await budgetsService.createBudget(payload)
        showSuccess('Budget créé avec succès')
      }

      await loadBudgets()
      resetForm()
    } catch (e) {
      const errorMessage = e?.message || 'Erreur lors de l\'enregistrement du budget'
      showError(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      mois: '',
      montant_max: '',
      id_categories_depenses: ''
    })
    setErrors({})
    setEditingBudget(null)
    setIsModalOpen(false)
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      mois: budget.mois,
      montant_max: budget.montant_max.toString(),
      id_categories_depenses: (budget.id_categorie_depense ?? budget.id_categories_depenses).toString()
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    const budget = budgets.find(b => b.id_budget === id)
    setSelectedBudget(budget || null)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    try {
      if (!selectedBudget) return
      await budgetsService.deleteBudget(selectedBudget.id_budget)
      showSuccess('Budget supprimé avec succès')
      await loadBudgets()
    } catch (e) {
      const errorMessage = e?.message || 'Erreur lors de la suppression du budget'
      showError(errorMessage)
    } finally {
      setIsDeleteOpen(false)
      setSelectedBudget(null)
    }
  }

  const getBudgetStatus = (pourcentage) => {
    if (pourcentage >= 100) return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, label: 'Dépassé' }
    if (pourcentage >= 80) return { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle, label: 'Attention' }
    if (pourcentage >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: TrendingUp, label: 'Modéré' }
    return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Sain' }
  }

  const getProgressBarColor = (pourcentage) => {
    if (pourcentage >= 100) return 'bg-red-500'
    if (pourcentage >= 80) return 'bg-orange-500'
    if (pourcentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Budget</h1>
            <p className="text-gray-600 mt-2">Suivez et contrôlez vos dépenses par catégorie</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            <Plus className="w-5 h-5" />
            Nouveau Budget
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>
        )}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Budget vs Dépenses par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categorie" />
              <YAxis />
              <Tooltip formatter={(value) => [formatAmountDefault(value), '']} />
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
                outerRadius={100}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
              >
                {repartitionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatAmountDefault(value), 'Dépensé']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Évolution Budget */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Évolution Mensuelle</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [formatAmountDefault(value), 'Budget']} />
            <Line type="monotone" dataKey="montant" stroke="#3B82F6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

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

          <input
            type="month"
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Liste des Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(loading ? [] : filteredBudgets).map((budget) => {
          const status = getBudgetStatus(budget.pourcentage_utilise)
          const StatusIcon = status.icon
          
          return (
            <div key={budget.id_budget} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-900">{budget.categorie}</h3>
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
                  <span className="font-medium">{Number(budget.montant_max || 0).toLocaleString('fr-FR')}€</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dépensé</span>
                  <span className="font-medium text-red-600">{Number(budget.montant_depense || 0).toLocaleString('fr-FR')}€</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restant</span>
                  <span className="font-medium text-green-600">{Number(budget.montant_restant || 0).toLocaleString('fr-FR')}€</span>
                </div>

                {/* Barre de progression */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Utilisation</span>
                    <span className="text-sm font-medium">{budget.pourcentage_utilise}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(budget.pourcentage_utilise)}`}
                      style={{ width: `${Math.min(budget.pourcentage_utilise, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Statut */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${status.bg} mt-4`}>
                  <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Période: {budget.mois}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredBudgets.length === 0 && (
        <div className="text-center py-12">
          <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun budget trouvé</p>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.mois 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  value={formData.mois}
                  onChange={(e) => {
                    setFormData({...formData, mois: e.target.value})
                    if (errors.mois) {
                      setErrors({...errors, mois: ''})
                    }
                  }}
                  placeholder="YYYY-MM"
                />
                {errors.mois && (
                  <p className="text-red-500 text-sm mt-1">{errors.mois}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant Maximum 
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.montant_max 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  value={formData.montant_max}
                  onChange={(e) => {
                    setFormData({...formData, montant_max: e.target.value})
                    if (errors.montant_max) {
                      setErrors({...errors, montant_max: ''})
                    }
                  }}
                />
                {errors.montant_max && (
                  <p className="text-red-500 text-sm mt-1">{errors.montant_max}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie de Dépense
                </label>
                <select
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.id_categories_depenses 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                  value={formData.id_categories_depenses}
                  onChange={(e) => {
                    setFormData({...formData, id_categories_depenses: e.target.value})
                    if (errors.id_categories_depenses) {
                      setErrors({...errors, id_categories_depenses: ''})
                    }
                  }}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
                {errors.id_categories_depenses && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_categories_depenses}</p>
                )}
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
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {editingBudget ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer ce budget ?</h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer
                {selectedBudget?.categorie ? ` "${selectedBudget.categorie}"` : ''} ?<br />
                Cette action est irréversible.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => { setIsDeleteOpen(false); setSelectedBudget(null) }}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}