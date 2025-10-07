"use client"
import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  User,
  ArrowUpRight,
  BarChart3,
  AlertTriangle,
  X
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
import { colors } from '@/styles/colors'
import revenuesService from '@/services/revenuesService'

export default function RevenuePage() {
  const [revenues, setRevenues] = useState([])
  const [categories, setCategories] = useState([])
  const [comptes, setComptes] = useState([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRevenue, setEditingRevenue] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [revenueToDelete, setRevenueToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  const [formData, setFormData] = useState({
    montant: '',
    date_revenu: '',
    source: '',
    id_categorie_revenu: '',
    id_compte: ''
  })

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchComptes(), fetchRevenues()])
      } catch (e) {
        console.error('Erreur lors du chargement initial des données revenus:', e)
      }
    }
    loadInitialData()
  }, [])

  const fetchRevenues = async () => {
    const data = await revenuesService.getRevenues()
    // Mapper les champs backend vers ceux utilisés par l'UI
    const mapped = (Array.isArray(data) ? data : []).map((r) => ({
      id_revenu: r.id_revenu,
      id_user: r.id_user,
      montant: Number(r.montant),
      date_revenu: r.date_revenu,
      source: r.source,
      id_categorie_revenu: r.id_categorie_revenu,
      id_compte: r.id_compte,
      categorie: r.categorie_nom || r.categorie || '',
      compte: r.compte_nom || r.compte || ''
    }))
    setRevenues(mapped)
  }

  const fetchCategories = async () => {
    const data = await revenuesService.getRevenueCategories()
    const mapped = (Array.isArray(data) ? data : []).map((c) => ({ id: c.id, nom: c.nom }))
    setCategories(mapped)
  }

  const fetchComptes = async () => {
    const data = await revenuesService.getMyComptes()
    const mapped = (Array.isArray(data) ? data : []).map((a) => ({
      id: a.id_compte ?? a.id,
      nom: a.nom,
      type: a.type,
      solde: a.solde,
      devise: a.devise || a.currency,
      currency: a.currency,
      currencySymbol: a.currencySymbol
    }))
    setComptes(mapped)
  }

  const formatDateForInput = (value) => {
    if (!value) return ''
    try {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return date.toISOString().slice(0, 10)
    } catch {
      return ''
    }
  }

  // Modal de base (aligné avec Dépenses)
  const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null
    const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    )
  }

  // Modal de confirmation suppression (même style que Dépenses)
  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, item }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression" size="sm">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Supprimer ce revenu ?</h3>
          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer
            {item?.source ? ` "${item.source}"` : ''} ?<br />
            Cette action est irréversible.
          </p>
          <div className="flex justify-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
            <button onClick={onConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  // Données pour les graphiques (dynamiques)
  const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  const monthlyTotals = Array.from({ length: 12 }, () => 0)
  revenues.forEach((rev) => {
    const date = new Date(rev.date_revenu)
    if (!Number.isNaN(date.getTime())) {
      const monthIndex = date.getMonth()
      monthlyTotals[monthIndex] += Number(rev.montant) || 0
    }
  })
  const monthlyData = monthLabels.map((label, idx) => ({ month: label, montant: monthlyTotals[idx] }))

  const categoryColorPalette = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#22C55E']
  const categorySums = new Map()
  revenues.forEach((rev) => {
    const name = (rev.categorie || 'Autres').toString()
    const current = categorySums.get(name) || 0
    categorySums.set(name, current + (Number(rev.montant) || 0))
  })
  const categoryData = Array.from(categorySums.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({ name, value, color: categoryColorPalette[index % categoryColorPalette.length] }))

  // --- Devise & formatage (aligné sur Dépenses) ---
  const getLocalStorageDevise = () => {
    try {
      const val = (typeof window !== 'undefined') ? (localStorage.getItem('devise') || localStorage.getItem('currency') || localStorage.getItem('currencyCode')) : ''
      return (val || '').toString().toUpperCase()
    } catch {
      return ''
    }
  }

  const getAccountById = (accountId) => {
    return comptes.find(c => (c.id) === (typeof accountId === 'string' ? parseInt(accountId) : accountId))
  }

  const getAccountCurrencySymbol = (accountId) => {
    const account = getAccountById(accountId)
    return account?.currencySymbol || account?.devise || account?.currency || '€'
  }

  const isAccountMGA = (accountId) => {
    const account = getAccountById(accountId)
    const code = (account?.devise || account?.currency || '').toString().toUpperCase()
    return code === 'MGA'
  }

  const formatAmountForAccount = (amount, accountId) => {
    const num = Number(amount || 0)
    if (isAccountMGA(accountId)) {
      const intStr = Math.round(num).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
      return `${intStr}Ar`
    }
    const symbol = getAccountCurrencySymbol(accountId)
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${symbol}`
  }

  const getDefaultCurrencySymbol = () => {
    const lsCode = getLocalStorageDevise()
    if (lsCode === 'MGA') return 'Ar'
    if (lsCode) return lsCode
    const first = comptes && comptes.length > 0 ? comptes[0] : null
    const code = (first?.devise || first?.currency || '').toString().toUpperCase()
    if (code === 'MGA') return 'Ar'
    return first?.currencySymbol || first?.devise || first?.currency || '€'
  }

  const formatAmountDefault = (amount) => {
    const lsCode = getLocalStorageDevise()
    const first = comptes && comptes.length > 0 ? comptes[0] : null
    const code = (lsCode || first?.devise || first?.currency || '').toString().toUpperCase()
    const num = Number(amount || 0)
    if (code === 'MGA') {
      const intStr = Math.round(num).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
      return `${intStr}Ar`
    }
    const symbol = getDefaultCurrencySymbol()
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${symbol}`
  }

  // Calculs statistiques
  const totalRevenues = revenues.reduce((sum, rev) => sum + rev.montant, 0)
  const averageRevenue = totalRevenues / revenues.length || 0
  const thisMonthRevenues = revenues.filter(rev => 
    new Date(rev.date_revenu).getMonth() === new Date().getMonth()
  ).reduce((sum, rev) => sum + rev.montant, 0)

  // Filtrage des revenus
  const filteredRevenues = revenues.filter(revenue => {
    const matchesSearch = revenue.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         revenue.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || revenue.id_categorie_revenu.toString() === selectedCategory
    const matchesMonth = !selectedMonth || new Date(revenue.date_revenu).getMonth().toString() === selectedMonth
    
    return matchesSearch && matchesCategory && matchesMonth
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      montant: parseFloat(formData.montant),
      date_revenu: formData.date_revenu,
      source: formData.source,
      id_categorie_revenu: Number(formData.id_categorie_revenu),
      id_compte: Number(formData.id_compte)
    }

    try {
      if (editingRevenue) {
        await revenuesService.updateRevenue(editingRevenue.id_revenu, payload)
      } else {
        await revenuesService.createRevenue(payload)
      }
      await fetchRevenues()
      resetForm()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du revenu:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      montant: '',
      date_revenu: '',
      source: '',
      id_categorie_revenu: '',
      id_compte: ''
    })
    setEditingRevenue(null)
    setIsModalOpen(false)
  }

  const handleEdit = (revenue) => {
    setEditingRevenue(revenue)
    setFormData({
      montant: revenue.montant.toString(),
      date_revenu: formatDateForInput(revenue.date_revenu),
      source: revenue.source,
      id_categorie_revenu: revenue.id_categorie_revenu.toString(),
      id_compte: revenue.id_compte.toString()
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await revenuesService.deleteRevenue(id)
      await fetchRevenues()
    } catch (err) {
      console.error('Erreur lors de la suppression du revenu:', err)
    }
  }

  const openDeleteConfirm = (revenue) => {
    setRevenueToDelete(revenue)
    setIsConfirmOpen(true)
  }

  const closeDeleteConfirm = () => {
    setIsConfirmOpen(false)
    setRevenueToDelete(null)
  }

  const confirmDelete = async () => {
    if (!revenueToDelete) return
    await handleDelete(revenueToDelete.id_revenu)
    closeDeleteConfirm()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Revenus</h1>
            <p className="text-gray-600 mt-2">Gérez et suivez vos sources de revenus</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            <Plus className="w-5 h-5" />
            Nouveau Revenu
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total des Revenus</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmountDefault(totalRevenues)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenu Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmountDefault(averageRevenue)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce Mois</p>
                <p className="text-2xl font-bold text-gray-900">{formatAmountDefault(thisMonthRevenues)}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nombre de Sources</p>
                <p className="text-2xl font-bold text-gray-900">{revenues.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Évolution Mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatAmountDefault(value), 'Montant']} />
              <Line type="monotone" dataKey="montant" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Répartition par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatAmountDefault(value), 'Montant']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par source ou catégorie..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Tous les mois</option>
            <option value="0">Janvier</option>
            <option value="1">Février</option>
            <option value="2">Mars</option>
            <option value="3">Avril</option>
            <option value="4">Mai</option>
            <option value="5">Juin</option>
            <option value="6">Juillet</option>
            <option value="7">Août</option>
            <option value="8">Septembre</option>
            <option value="9">Octobre</option>
            <option value="10">Novembre</option>
            <option value="11">Décembre</option>
          </select>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tableau des Revenus */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Source</th>
                <th className="text-left p-4 font-medium text-gray-700">Catégorie</th>
                <th className="text-left p-4 font-medium text-gray-700">Compte</th>
                <th className="text-right p-4 font-medium text-gray-700">Montant</th>
                <th className="text-center p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRevenues.map((revenue, index) => (
                <tr key={revenue.id_revenu} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(revenue.date_revenu).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{revenue.source}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {revenue.categorie}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{revenue.compte}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-semibold text-green-600">{formatAmountForAccount(revenue.montant, revenue.id_compte)}</span>
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(revenue)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(revenue)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRevenues.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun revenu trouvé</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingRevenue ? 'Modifier le Revenu' : 'Nouveau Revenu'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant ({(() => {
                    const selected = getAccountById(parseInt(formData.id_compte))
                    const lsCode = getLocalStorageDevise()
                    const code = (lsCode || selected?.devise || selected?.currency || '').toString().toUpperCase()
                    if (code === 'MGA') return 'Ar'
                    return selected?.currencySymbol || selected?.devise || selected?.currency || lsCode || '€'
                  })()})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.montant}
                  onChange={(e) => setFormData({...formData, montant: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.date_revenu}
                  onChange={(e) => setFormData({...formData, date_revenu: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source/Description
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder="Ex: Salaire janvier, Freelance projet X..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.id_categorie_revenu}
                  onChange={(e) => setFormData({...formData, id_categorie_revenu: e.target.value})}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compte de destination
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.id_compte}
                  onChange={(e) => setFormData({...formData, id_compte: e.target.value})}
                >
                  <option value="">Sélectionner un compte</option>
                  {comptes.map(compte => (
                    <option key={compte.id} value={compte.id}>{compte.nom}</option>
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
                  type="submit"
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {editingRevenue ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        item={revenueToDelete}
      />
    </div>
  )
}