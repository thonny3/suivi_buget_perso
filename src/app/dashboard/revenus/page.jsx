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
import sharedAccountsService from '@/services/sharedAccountsService'
import apiService from '@/services/apiService'
import { API_CONFIG } from '@/config/api'
import { useToast } from '@/hooks/useToast'

export default function RevenuePage() {
  const { showSuccess, showError } = useToast()
  const [revenues, setRevenues] = useState([])
  const [categories, setCategories] = useState([])
  const [comptes, setComptes] = useState([])
  const [usersById, setUsersById] = useState({})

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
        showError('Erreur lors du chargement des données')
      }
    }
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchRevenues = async () => {
    try {
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
        compte: r.compte_nom || r.compte || '',
        user_prenom: r.user_prenom,
        user_nom: r.user_nom,
        user_email: r.user_email,
        user_image: r.user_image,
      }))
      setRevenues(mapped)
    } catch (err) {
      console.error('Erreur lors du chargement des revenus:', err)
      showError('Erreur lors du chargement des revenus')
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await revenuesService.getRevenueCategories()
      const mapped = (Array.isArray(data) ? data : []).map((c) => ({ id: c.id, nom: c.nom }))
      setCategories(mapped)
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err)
      showError('Erreur lors du chargement des catégories')
    }
  }

  const fetchComptes = async () => {
    try {
      const my = await revenuesService.getMyComptes()
      const own = (Array.isArray(my) ? my : []).map((a) => ({
        id: a.id_compte ?? a.id,
        nom: a.nom,
        type: a.type,
        solde: a.solde,
        devise: a.devise || a.currency,
        currency: a.currency,
        currencySymbol: a.currencySymbol
      }))

    // Shared contributor accounts
    let sharedContrib = []
    try {
      const storedUser = localStorage.getItem('user')
      const userId = storedUser ? (JSON.parse(storedUser)?.id_user || null) : null
      if (userId) {
        const sharedRes = await sharedAccountsService.getSharedAccountsByUser(userId)
        if (sharedRes?.success && Array.isArray(sharedRes.data)) {
          const baseShared = sharedRes.data
            .map(acc => sharedAccountsService.formatSharedAccount(acc))
            .filter(acc => acc.role === 'contributeur')

          const detailed = await Promise.all(baseShared.map(async (acc) => {
            try {
              const accountId = acc.id_compte ?? acc.id
              const details = accountId ? await apiService.getAccountById(accountId) : null
              const devise = details?.devise || details?.currency || acc.devise || acc.currency || ''
              const currencySymbol = (devise && devise.toUpperCase() === 'MGA') ? 'Ar' : (details?.currencySymbol || acc.currencySymbol)
              return { id: accountId, nom: acc.nom, type: acc.type, solde: acc.solde, devise, currency: devise, currencySymbol, isShared: true }
            } catch (_) {
              const accountId = acc.id_compte ?? acc.id
              return { id: accountId, nom: acc.nom, type: acc.type, solde: acc.solde, devise: acc.devise, currency: acc.currency, currencySymbol: acc.currencySymbol, isShared: true }
            }
          }))
          sharedContrib = detailed
        }
      }
    } catch {}

    const merged = [...own, ...sharedContrib]
    setComptes(merged)

    // Build user map (for avatars in table)
    const userMap = {}
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const u = JSON.parse(storedUser)
        if (u?.id_user) {
          userMap[u.id_user] = { id_user: u.id_user, prenom: u.prenom, nom: u.nom, email: u.email, image: u.image || null }
        }
      }
    } catch {}
    const accountIds = Array.from(new Set(merged.map(a => a.id).filter(Boolean)))
    try {
      const lists = await Promise.all(accountIds.map(async (accId) => {
        try {
          const res = await sharedAccountsService.getSharedUsersByAccount(accId)
          return Array.isArray(res?.data) ? res.data : []
        } catch { return [] }
      }))
      lists.flat().forEach(u => {
        const id = u.id_user ?? u.user_id ?? u.id
        if (!id) return
        userMap[id] = { id_user: id, prenom: u.prenom || u.firstName || '', nom: u.nom || u.lastName || '', email: u.email || '', image: u.image || u.image_utilisateur || null }
      })
    } catch {}
    setUsersById(userMap)
    } catch (err) {
      console.error('Erreur lors du chargement des comptes:', err)
      showError('Erreur lors du chargement des comptes')
    }
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
    const devise = (account?.devise || account?.currency || '').toString().toUpperCase()
    if (devise === 'MGA') return 'Ar'
    return account?.currencySymbol || account?.devise || account?.currency || '€'
  }

  const isAccountMGA = (accountId) => {
    const account = getAccountById(accountId)
    const code = (account?.devise || account?.currency || '').toString().toUpperCase()
    const symbol = (account?.currencySymbol || '').toString()
    if (code === 'MGA' || symbol === 'Ar') return true
    try {
      const user = localStorage.getItem('user')
      const userDevise = user ? (JSON.parse(user)?.devise || '').toString().toUpperCase() : ''
      return userDevise === 'MGA'
    } catch { return false }
  }

  const formatAmountForAccount = (amount, accountId) => {
    const num = Number(amount || 0)
    if (isAccountMGA(accountId)) {
      const intStr = Math.round(num).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
      return `${intStr} Ar`
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
      return `${intStr} Ar`
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
  // Nombre de catégories uniques qui ont des revenus
  const uniqueCategoriesCount = new Set(revenues.map(rev => rev.id_categorie_revenu).filter(id => id != null && id !== '')).size

  // Filtrage des revenus
  const filteredRevenues = revenues.filter(revenue => {
    const matchesSearch = (revenue.source || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (revenue.categorie || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || String(revenue.id_categorie_revenu ?? '') === selectedCategory
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
        showSuccess('Revenu mis à jour avec succès')
      } else {
        await revenuesService.createRevenue(payload)
        showSuccess('Revenu créé avec succès')
      }
      await fetchRevenues()
      resetForm()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du revenu:', err)
      const errorMessage = err?.message || 'Erreur lors de l\'enregistrement du revenu'
      showError(errorMessage)
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
      showSuccess('Revenu supprimé avec succès')
      await fetchRevenues()
    } catch (err) {
      console.error('Erreur lors de la suppression du revenu:', err)
      const errorMessage = err?.message || 'Erreur lors de la suppression du revenu'
      showError(errorMessage)
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Revenus</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Gérez et suivez vos sources de revenus</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nouveau Revenu</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 md:mb-8">
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
                <p className="text-2xl font-bold text-gray-900">{uniqueCategoriesCount}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 md:mb-8">
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
                outerRadius={100}
                innerRadius={50}
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
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Source/Description</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Catégorie</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm hidden md:table-cell">Compte</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm hidden lg:table-cell">Utilisateur</th>
                <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Date</th>
                <th className="text-right p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Montant</th>
                <th className="text-center p-3 sm:p-4 font-medium text-gray-700 text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRevenues.map((revenue, index) => (
                <tr key={revenue.id_revenu} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 sm:p-4">
                    <div className="font-medium text-gray-900 text-sm">{revenue.source}</div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm">
                      {revenue.categorie}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-gray-600 text-sm hidden md:table-cell">{revenue.compte}</td>
                  <td className="p-3 sm:p-4 hidden lg:table-cell">
                    {(() => {
                      const backendUser = { prenom: revenue.user_prenom, nom: revenue.user_nom, email: revenue.user_email, image: revenue.user_image }
                      const hasBackendUser = backendUser.prenom || backendUser.nom || backendUser.email || backendUser.image
                      const u = hasBackendUser ? backendUser : (usersById[revenue.id_user] || {})
                      const displayName = (u.prenom || u.nom) ? `${u.prenom || ''} ${u.nom || ''}`.trim() : (u.email || `ID: ${revenue.id_user}`)
                      const initial = (u.prenom || u.nom || u.email || 'U').toString().trim().charAt(0).toUpperCase()
                      const img = u.image
                      const url = (() => {
                        if (!img) return null
                        if (/^https?:\/\//i.test(img)) return img
                        const API_ORIGIN = API_CONFIG.BASE_URL.replace(/\/api$/, '')
                        const cleaned = img.replace(/^\/+/, '')
                        return cleaned.toLowerCase().startsWith('uploads/') ? `${API_ORIGIN}/${cleaned}` : `${API_ORIGIN}/uploads/${cleaned}`
                      })()
                      return (
                        <div className="flex items-center gap-2">
                          {url ? (
                            <img src={url} alt={displayName} className="w-6 h-6 rounded-full object-cover border" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          ) : (
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center border">
                              <span className="text-emerald-700 text-xs font-medium">{initial}</span>
                            </div>
                          )}
                          <span className="text-sm text-gray-700">{displayName}</span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm">{new Date(revenue.date_revenu).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-semibold text-green-600 text-sm sm:text-base">{formatAmountForAccount(revenue.montant, revenue.id_compte)}</span>
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 my-4">
            <h2 className="text-xl font-semibold mb-6">
              {editingRevenue ? 'Modifier le Revenu' : 'Nouveau Revenu'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Montant
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
