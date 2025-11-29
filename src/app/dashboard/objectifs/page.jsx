"use client"
import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trophy,
  Zap,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Smartphone,
  Eye
} from 'lucide-react'
import { colors } from '@/styles/colors'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import objectifsService from '@/services/objectifsService'
import contributionsService from '@/services/contributionsService'
import accountsService from '@/services/accountsService'
import sharedAccountsService from '@/services/sharedAccountsService'
import apiService from '@/services/apiService'
import useToast from '@/hooks/useToast'
import { useLanguage } from '@/context/LanguageContext'

export default function ObjectifsPage() {
  const { showSuccess, showError } = useToast()
  const { t } = useLanguage()
  const [objectifs, setObjectifs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isContribOpen, setIsContribOpen] = useState(false)
  const [contribLoading, setContribLoading] = useState(false)
  const [contribError, setContribError] = useState('')
  const [selectedForContrib, setSelectedForContrib] = useState(null)
  const [contributions, setContributions] = useState([])
  const [isRewardOpen, setIsRewardOpen] = useState(false)
  const [rewardObjectif, setRewardObjectif] = useState(null)
  const [userSymbol, setUserSymbol] = useState('')

  const resolveCurrencySymbol = (deviseLike) => {
    const d = (deviseLike || '').toString().toUpperCase()
    if (!d) return ''
    if (d === 'MGA') return 'Ar'
    if (d === 'EUR') return '€'
    if (d === 'USD') return '$'
    if (d === 'GBP') return '£'
    return d
  }

  useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        try {
          const storedUser = localStorage.getItem('user')
          const devise = storedUser ? (JSON.parse(storedUser)?.devise || '') : ''
          setUserSymbol(resolveCurrencySymbol(devise))
        } catch (_) {}
        const data = await objectifsService.list()
        setObjectifs(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Erreur chargement objectifs', e)
        const msg = e?.message || t('objectifs.errors.loadError')
        setError(msg)
        showError(msg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchObjectifs()
  }, [])

  const toYYYYMMDD = (value) => {
    if (!value) return ''
    if (typeof value === 'string' && value.includes('T')) {
      return value.slice(0, 10)
    }
    if (value instanceof Date) {
      const y = value.getFullYear()
      const m = String(value.getMonth() + 1).padStart(2, '0')
      const d = String(value.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    return String(value).slice(0, 10)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingObjectif, setEditingObjectif] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddingMoney, setIsAddingMoney] = useState(false)
  const [addMoneyAmount, setAddMoneyAmount] = useState('')
  const [selectedObjectifForMoney, setSelectedObjectifForMoney] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    montant_objectif: '',
    date_limite: '',
    icone: 'Target',
    couleur: '#3B82F6'
  })
  const [formErrors, setFormErrors] = useState({})

  const iconOptions = [
    { name: 'Target', component: Target, label: t('objectifs.icons.general') },
    { name: 'Car', component: Car, label: t('objectifs.icons.car') },
    { name: 'Home', component: Home, label: t('objectifs.icons.home') },
    { name: 'Plane', component: Plane, label: t('objectifs.icons.travel') },
    { name: 'GraduationCap', component: GraduationCap, label: t('objectifs.icons.education') },
    { name: 'Heart', component: Heart, label: t('objectifs.icons.health') },
    { name: 'Smartphone', component: Smartphone, label: t('objectifs.icons.technology') },
    { name: 'Trophy', component: Trophy, label: t('objectifs.icons.reward') }
  ]

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ]

  const notifyNavbar = (detail) => {
    if (typeof window === 'undefined' || !detail?.message) return
    window.dispatchEvent(new CustomEvent('dashboard-notification', {
      detail: {
        type: detail.type || t('objectifs.title'),
        message: detail.message
      }
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const getInputClasses = (field) => {
    const hasError = Boolean(formErrors[field])
    const base = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
    return hasError
      ? `${base} border-red-400 dark:border-red-500 focus:ring-red-500`
      : `${base} border-gray-200 dark:border-gray-600 focus:ring-green-500`
  }

  const validateForm = () => {
    const errors = {}
    const trimmedName = formData.nom.trim()
    if (!trimmedName) {
      errors.nom = t('objectifs.errors.nameRequired')
    } else if (trimmedName.length < 3) {
      errors.nom = t('objectifs.errors.nameMin')
    }

    const amountValue = parseFloat(formData.montant_objectif)
    if (formData.montant_objectif === '' || Number.isNaN(amountValue)) {
      errors.montant_objectif = t('objectifs.errors.amountRequired')
    } else if (amountValue <= 0) {
      errors.montant_objectif = t('objectifs.errors.amountPositive')
    }

    if (!formData.date_limite) {
      errors.date_limite = t('objectifs.errors.dateRequired')
    } else {
      const selectedDate = new Date(formData.date_limite)
      const today = new Date()
      selectedDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today && !editingObjectif) {
        errors.date_limite = t('objectifs.errors.dateFuture')
      }
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      const message = t('objectifs.errors.validationSummary')
      showError(message)
      notifyNavbar({ message })
      return false
    }
    return true
  }

  // Calculs statistiques
  const totalObjectifs = objectifs.length
  const objectifsAtteints = objectifs.filter(obj => obj.statut === t('objectifs.status.achieved') || obj.statut === 'Atteint').length
  const objectifsEnCours = objectifs.filter(obj => obj.statut === t('objectifs.status.inProgress') || obj.statut === 'En cours').length
  const objectifsRetard = objectifs.filter(obj => obj.statut === t('objectifs.status.delayed') || obj.statut === 'Retard').length
  const montantTotalObjectifs = objectifs.reduce((sum, obj) => sum + (parseFloat(obj.montant_objectif) || 0), 0)
  const montantTotalActuel = objectifs.reduce((sum, obj) => sum + (parseFloat(obj.montant_actuel) || 0), 0)
  const progressionGlobale = montantTotalObjectifs > 0 ? Math.round((montantTotalActuel / montantTotalObjectifs) * 100) : 0

  // Données pour les graphiques
  const progressionData = objectifs.map(obj => ({
    nom: obj.nom.substring(0, 10) + '...',
    objectif: obj.montant_objectif,
    actuel: obj.montant_actuel,
    pourcentage: obj.pourcentage
  }))

  const statutsData = [
    { name: t('objectifs.achieved'), value: objectifsAtteints, color: '#10B981' },
    { name: t('objectifs.inProgress'), value: objectifsEnCours, color: '#3B82F6' },
    { name: t('objectifs.delayed'), value: objectifsRetard, color: '#EF4444' }
  ]

  // Filtrage des objectifs
  const filteredObjectifs = objectifs.filter(objectif => {
    const matchesSearch = objectif.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || objectif.statut === filterStatus
    return matchesSearch && matchesStatus
  })

  const updateObjectifStatus = (objectif) => {
    const today = new Date()
    const dateLimit = new Date(objectif.date_limite)
    
    if (objectif.pourcentage >= 100) {
      return t('objectifs.status.achieved')
    } else if (today > dateLimit) {
      return t('objectifs.status.delayed')
    } else {
      return t('objectifs.status.inProgress')
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const trimmedName = formData.nom.trim()
      const amountValue = parseFloat(formData.montant_objectif)
      const normalizedDate = toYYYYMMDD(formData.date_limite)
      if (editingObjectif) {
        await objectifsService.update(editingObjectif.id_objectif, {
          nom: trimmedName,
          montant_objectif: amountValue,
          date_limite: normalizedDate,
          // backend columns include montant_actuel optionally on update
          montant_actuel: editingObjectif.montant_actuel,
          icone: formData.icone,
          couleur: formData.couleur,
        })
      } else {
        await objectifsService.create({
          nom: trimmedName,
          montant_objectif: amountValue,
          date_limite: normalizedDate,
          montant_actuel: 0,
          statut: t('objectifs.status.inProgress'),
          pourcentage: 0,
          icone: formData.icone,
          couleur: formData.couleur,
        })
      }
      // refresh list
      const refreshed = await objectifsService.list()
      setObjectifs(Array.isArray(refreshed) ? refreshed : [])
    } catch (e) {
      console.error('Erreur enregistrement objectif', e)
      showError(e?.message || t('objectifs.errors.saveError'))
      return
    }
    
    resetForm()
    showSuccess(editingObjectif ? t('objectifs.success.updated') : t('objectifs.success.created'))
  }

  const handleAddMoney = async () => {
    if (!addMoneyAmount || !selectedObjectifForMoney) {
      alert(t('objectifs.errors.enterAmount'))
      return
    }
    if (!selectedAccountId) {
      alert(t('objectifs.errors.selectAccount'))
      return
    }

    const montant = parseFloat(addMoneyAmount)
    try {
      await contributionsService.create({
        id_objectif: selectedObjectifForMoney.id_objectif,
        montant,
        id_compte: Number(selectedAccountId),
      })
      const refreshed = await objectifsService.list()
      setObjectifs(Array.isArray(refreshed) ? refreshed : [])
      const updated = Array.isArray(refreshed) ? refreshed.find(o => o.id_objectif === selectedObjectifForMoney.id_objectif) : null
      if (updated && (updated.statut === 'Atteint' || updated.statut === t('objectifs.status.achieved'))) {
        setRewardObjectif(updated)
        setIsRewardOpen(true)
        showSuccess(t('objectifs.success.goalAchieved'))
      } else {
        showSuccess(t('objectifs.success.contributionAdded'))
      }
    } catch (e) {
      console.error('Erreur ajout d\'argent', e)
      showError(e?.message || t('objectifs.errors.updateAmountError'))
      return
    }

    setAddMoneyAmount('')
    setSelectedObjectifForMoney(null)
    setIsAddingMoney(false)
    setSelectedAccountId('')
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      montant_objectif: '',
      date_limite: '',
      icone: 'Target',
      couleur: '#3B82F6'
    })
    setFormErrors({})
    setEditingObjectif(null)
    setIsModalOpen(false)
  }

  const handleEdit = (objectif) => {
    setEditingObjectif(objectif)
    setFormErrors({})
    setFormData({
      nom: objectif.nom,
      montant_objectif: objectif.montant_objectif.toString(),
      date_limite: toYYYYMMDD(objectif.date_limite),
      icone: objectif.icone,
      couleur: objectif.couleur
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm(t('objectifs.confirmDelete'))) return
    try {
      await objectifsService.remove(id)
      const refreshed = await objectifsService.list()
      setObjectifs(Array.isArray(refreshed) ? refreshed : [])
    } catch (e) {
      console.error('Erreur suppression objectif', e)
      showError(e?.message || t('objectifs.errors.deleteError'))
    }
  }

  const openContributions = async (objectif) => {
    setSelectedForContrib(objectif)
    setContributions([])
    setContribError('')
    setIsContribOpen(true)
    setContribLoading(true)
    try {
      const data = await contributionsService.listByObjectif(objectif.id_objectif)
      setContributions(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Erreur chargement contributions', e)
      const msg = e?.message || t('objectifs.errors.loadContributionsError')
      setContribError(msg)
      showError(msg)
    } finally {
      setContribLoading(false)
    }
  }

  const getStatusIcon = (statut) => {
    const achieved = t('objectifs.status.achieved')
    const inProgress = t('objectifs.status.inProgress')
    const delayed = t('objectifs.status.delayed')
    if (statut === 'Atteint' || statut === achieved) {
      return { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900' }
    } else if (statut === 'En cours' || statut === inProgress) {
      return { icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900' }
    } else if (statut === 'Retard' || statut === delayed) {
      return { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900' }
    }
    return { icon: Target, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' }
  }

  const getProgressColor = (pourcentage) => {
    if (pourcentage >= 100) return 'bg-green-500 dark:bg-green-600'
    if (pourcentage >= 75) return 'bg-blue-500 dark:bg-blue-600'
    if (pourcentage >= 50) return 'bg-yellow-500 dark:bg-yellow-600'
    return 'bg-gray-400 dark:bg-gray-600'
  }

  const getDaysRemaining = (dateLimit) => {
    const today = new Date()
    const limit = new Date(dateLimit)
    const diffTime = limit - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(option => option.name === iconName)
    return iconOption ? iconOption.component : Target
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-gray-600 dark:text-gray-400">{t('objectifs.loading')}</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('objectifs.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('objectifs.subtitle')}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            <Plus className="w-5 h-5" />
            {t('objectifs.newGoal')}
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('objectifs.statistics.totalGoals')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalObjectifs}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('objectifs.statistics.achieved')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{objectifsAtteints}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('objectifs.statistics.progression')}</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{progressionGlobale}%</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('objectifs.statistics.totalAmount')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(montantTotalObjectifs).toLocaleString()}{userSymbol}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('objectifs.charts.progressionByGoal')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="nom" stroke="#6b7280" className="dark:stroke-gray-400" />
              <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}${userSymbol}`, '']} contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="objectif" fill="#E5E7EB" name={t('objectifs.goalLabelShort')} />
              <Bar dataKey="actuel" fill="#10B981" name={t('objectifs.current')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('objectifs.charts.statusDistribution')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statutsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statutsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, t('objectifs.goal')]} contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={t('objectifs.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">{t('objectifs.allStatuses')}</option>
            <option value={t('objectifs.status.inProgress')}>{t('objectifs.inProgress')}</option>
            <option value={t('objectifs.status.achieved')}>{t('objectifs.achieved')}</option>
            <option value={t('objectifs.status.delayed')}>{t('objectifs.delayed')}</option>
          </select>

          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('objectifs.export')}
          </button>
        </div>
      </div>

      {/* Liste des Objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredObjectifs.map((objectif) => {
          const status = getStatusIcon(objectif.statut)
          const StatusIcon = status.icon
          const IconComponent = getIconComponent(objectif.icone)
          const daysRemaining = getDaysRemaining(objectif.date_limite)
          
          return (
            <div key={objectif.id_objectif} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${objectif.couleur}20` }}
                  >
                    <IconComponent 
                      className="w-6 h-6" 
                      style={{ color: objectif.couleur }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{objectif.nom}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openContributions(objectif)}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t('objectifs.viewContributions')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(objectif)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(objectif.id_objectif)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progression */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('objectifs.progression')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{objectif.pourcentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(objectif.pourcentage)}`}
                    style={{ width: `${Math.min(objectif.pourcentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Montants */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('objectifs.current')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Number(objectif.montant_actuel).toLocaleString()}{userSymbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('objectifs.goalLabelShort')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Number(objectif.montant_objectif).toLocaleString()}{userSymbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('objectifs.remaining')}</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {Number((parseFloat(objectif.montant_objectif)||0) - (parseFloat(objectif.montant_actuel)||0)).toLocaleString()}{userSymbol}
                  </span>
                </div>
              </div>

              {/* Date limite */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>{t('objectifs.deadlineLabel')} {new Date(objectif.date_limite).toLocaleDateString('fr-FR')}</span>
                {daysRemaining > 0 && (
                  <span className="text-blue-600 dark:text-blue-400">({daysRemaining} {t('objectifs.days')})</span>
                )}
                {daysRemaining <= 0 && (objectif.statut !== 'Atteint' && objectif.statut !== t('objectifs.status.achieved')) && (
                  <span className="text-red-600 dark:text-red-400">{t('objectifs.expired')}</span>
                )}
              </div>

              {/* Statut */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${status.bg} mb-4`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>
                  {objectif.statut}
                </span>
              </div>

              {/* Action d'ajout d'argent */}
              {(objectif.statut !== 'Atteint' && objectif.statut !== t('objectifs.status.achieved')) && (
                <button
                  onClick={() => {
                    setSelectedObjectifForMoney(objectif)
                    setIsAddingMoney(true)
                    ;(async () => {
                      // Charger comptes propres + comptes partagés (si contributeur)
                      const res = await accountsService.getMyAccounts()
                      const ownAccounts = res?.success && Array.isArray(res.data) ? res.data : []
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
                                return { ...acc, id: accountId, id_compte: accountId, devise, currency: devise, currencySymbol, isShared: true }
                              } catch (_) {
                                const accountId = acc.id_compte ?? acc.id
                                return { ...acc, id: accountId, id_compte: accountId, isShared: true }
                              }
                            }))
                            sharedContrib = detailed
                          }
                        }
                      } catch (_) {}

                      const merged = [...ownAccounts, ...sharedContrib]
                      setAccounts(merged)
                    })()
                  }}
                  className="w-full text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  <Plus className="w-4 h-4" />
                  {t('objectifs.addMoney')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {filteredObjectifs.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('objectifs.noGoals')}</p>
        </div>
      )}

      {/* Modal Création/Modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar scroll-smooth">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {editingObjectif ? t('objectifs.editGoal') : t('objectifs.newGoal')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('objectifs.goalName')}
                </label>
                <input
                  type="text"
                  required
                  className={getInputClasses('nom')}
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  placeholder={t('objectifs.goalNamePlaceholder')}
                  aria-invalid={Boolean(formErrors.nom)}
                  aria-describedby="goal-name-error"
                />
                {formErrors.nom && (
                  <p id="goal-name-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {formErrors.nom}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('objectifs.goalAmount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className={getInputClasses('montant_objectif')}
                  value={formData.montant_objectif}
                  onChange={(e) => handleInputChange('montant_objectif', e.target.value)}
                  aria-invalid={Boolean(formErrors.montant_objectif)}
                  aria-describedby="goal-amount-error"
                  min="0"
                />
                {formErrors.montant_objectif && (
                  <p id="goal-amount-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {formErrors.montant_objectif}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('objectifs.deadline')}
                </label>
                <input
                  type="date"
                  required
                  className={getInputClasses('date_limite')}
                  value={formData.date_limite}
                  onChange={(e) => handleInputChange('date_limite', e.target.value)}
                  aria-invalid={Boolean(formErrors.date_limite)}
                  aria-describedby="goal-deadline-error"
                />
                {formErrors.date_limite && (
                  <p id="goal-deadline-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {formErrors.date_limite}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('objectifs.icon')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((option) => {
                    const IconComp = option.component
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setFormData({...formData, icone: option.name})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.icone === option.name 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <IconComp className="w-5 h-5 mx-auto" />
                        <span className="text-xs mt-1 block">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('objectifs.color')}
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, couleur: color})}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.couleur === color 
                          ? 'border-gray-400 dark:border-gray-500 scale-110' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors"
                >
                  {t('objectifs.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {editingObjectif ? t('objectifs.modify') : t('objectifs.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout d'argent */}
      {isAddingMoney && selectedObjectifForMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {t('objectifs.addMoneyTitle')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('objectifs.goalLabel')} <span className="font-medium">{selectedObjectifForMoney.nom}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('objectifs.amountToAdd')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('objectifs.debitAccount')}
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                  >
                    <option value="">{t('objectifs.selectAccount')}</option>
                    {accounts.map((acc) => (
                      <option key={acc.id_compte} value={acc.id_compte}>
                        {acc.nom} — {(parseFloat(acc.solde) || 0).toLocaleString()}{userSymbol}
                      </option>
                    ))}
                  </select>
                </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">{t('objectifs.currentAmount')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Number(selectedObjectifForMoney.montant_actuel).toLocaleString()}{userSymbol}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">{t('objectifs.goalAmountLabel')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{Number(selectedObjectifForMoney.montant_objectif).toLocaleString()}{userSymbol}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">{t('objectifs.remainingBefore')}</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {Number((parseFloat(selectedObjectifForMoney.montant_objectif)||0) - (parseFloat(selectedObjectifForMoney.montant_actuel)||0)).toLocaleString()}{userSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">{t('objectifs.afterAdd')}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {Number((parseFloat(selectedObjectifForMoney.montant_actuel) || 0) + (parseFloat(addMoneyAmount) || 0)).toLocaleString()}{userSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-700 dark:text-gray-300">{t('objectifs.remainingAfter')}</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {Number((parseFloat(selectedObjectifForMoney.montant_objectif)||0) - ((parseFloat(selectedObjectifForMoney.montant_actuel)||0) + (parseFloat(addMoneyAmount)||0))).toLocaleString()}{userSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{t('objectifs.progress')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(((selectedObjectifForMoney.montant_actuel + (parseFloat(addMoneyAmount) || 0)) / selectedObjectifForMoney.montant_objectif) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMoney(false)
                    setSelectedObjectifForMoney(null)
                    setAddMoneyAmount('')
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors"
                >
                  {t('objectifs.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleAddMoney}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {t('objectifs.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contributions */}
      {isContribOpen && selectedForContrib && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar scroll-smooth">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('objectifs.contributions')} — {selectedForContrib.nom}
              </h2>
              <button
                type="button"
                onClick={() => { setIsContribOpen(false); setSelectedForContrib(null); setContributions([]); setContribError('') }}
                className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm transition-colors"
              >
                {t('objectifs.close')}
              </button>
            </div>

            {contribError && (
              <div className="mb-3 p-3 rounded bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700">
                {contribError}
              </div>
            )}
            {contribLoading ? (
              <p className="text-gray-600 dark:text-gray-400">{t('objectifs.loadingContributions')}</p>
            ) : (
              <div className="space-y-3">
                {/* Summary */}
                {contributions.length > 0 && (
                  <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('objectifs.totalContributed')}</div>
                      <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                        {Number(contributions.reduce((sum, c) => sum + (parseFloat(c.montant) || 0), 0)).toLocaleString()} {userSymbol}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('objectifs.numberOfContributions')}</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{contributions.length}</div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('objectifs.goal')}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedForContrib.nom}</div>
                    </div>
                  </div>
                )}

                {contributions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">{t('objectifs.noContributions')}</p>
                ) : (
                  contributions.map((c) => (
                    <div key={c.id_contribution || `${c.id_objectif}-${c.date_contribution}-${c.montant}`}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-semibold">
                          +
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(c.date_contribution).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('objectifs.account')} {c.compte_nom || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold text-emerald-700 dark:text-emerald-400">{Number(c.montant).toLocaleString()}{userSymbol}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('objectifs.goalLabel')} {c.objectif_nom || selectedForContrib.nom}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reward / Celebration Modal */}
      {isRewardOpen && rewardObjectif && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop (solid, no gradient) */}
          <div className="absolute inset-0 bg-black/60"></div>
          {/* Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative rounded-2xl max-w-xl w-full p-8 overflow-hidden shadow-2xl" style={{ backgroundColor: colors.light }}>
              {/* No glow ring / rays to avoid gradients */}
              {/* Confetti */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => {
                  const left = Math.random() * 100
                  const delay = Math.random() * 1.2
                  const duration = 2 + Math.random() * 1.5
                  const size = 6 + Math.random() * 6
                  const colors = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899']
                  const color = colors[i % colors.length]
                  const rotate = Math.random() * 360
                  return (
                    <span
                      key={`confetti-${i}`}
                      className="absolute confetti"
                      style={{
                        left: `${left}%`,
                        top: '-10px',
                        width: `${size}px`,
                        height: `${size * 0.4}px`,
                        backgroundColor: color,
                        transform: `rotate(${rotate}deg)`,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`,
                      }}
                    />
                  )
                })}
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: '#FEF3C7', boxShadow: '0 0 0 6px rgba(254, 243, 199, 0.7)' }}>
                  <Trophy className="w-10 h-10 text-yellow-600 animate-bounce" />
                </div>
                <h3 className="text-3xl font-extrabold mb-2 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#16a34a,#22c55e,#10b981)' }}>
                  {t('objectifs.congratulations')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium">{rewardObjectif.nom}</p>
                <p className="text-green-600 dark:text-green-400 font-semibold mb-6 text-lg">{Number(rewardObjectif.montant_objectif).toLocaleString()}{userSymbol} {t('objectifs.achievedAmount')}</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsRewardOpen(false); setRewardObjectif(null) }}
                    className="px-5 py-2.5 rounded-lg text-white shadow-md"
                    style={{ backgroundColor: colors.secondary }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                    onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                  >
                    {t('objectifs.thanks')}
                  </button>
                </div>
              </div>

              {/* Local styles for confetti */}
              <style jsx>{`
                @keyframes confetti-fall {
                  0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
                  10% { opacity: 1; }
                  100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
                }
                .confetti {
                  position: absolute;
                  border-radius: 2px;
                  animation-name: confetti-fall;
                  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                  animation-iteration-count: 1;
                }
              `}</style>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}