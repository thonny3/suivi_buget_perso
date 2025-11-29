"use client"
import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  Edit3,
  Trash2,
  RefreshCw,
  Bell,
  BellOff,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Tv,
  Music,
  Smartphone,
  Cloud,
  Gamepad2,
  Car,
  Heart,
  Zap,
  Power,
  PowerOff
} from 'lucide-react'
import { colors } from '@/styles/colors'
import abonnementsService from '@/services/abonnementsService'
import { useAuth } from '@/app/context/AuthContext'
import accountsService from '@/services/accountsService'
import { useToast } from '@/hooks/useToast'
import { useLanguage } from '@/context/LanguageContext'

const getLocaleFromLanguage = (language) => {
  if (language === 'en') return 'en-US'
  if (language === 'mg') return 'mg-MG'
  return 'fr-FR'
}

const capitalizeFirstLetter = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatSubscriptionMonth = (dateString, language) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const locale = getLocaleFromLanguage(language)
  const month = date.toLocaleDateString(locale, { month: 'long' })
  return capitalizeFirstLetter(month)
}

export default function AbonnementsPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const { t, currentLanguage } = useLanguage()
  const [abonnements, setAbonnements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [renewedHistory, setRenewedHistory] = useState({})
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [renewTarget, setRenewTarget] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [comptes, setComptes] = useState([])
  const [loadingComptes, setLoadingComptes] = useState(false)
  const [selectedCompteId, setSelectedCompteId] = useState(null)
  const [selectedPeriods, setSelectedPeriods] = useState(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAbonnement, setEditingAbonnement] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFrequence, setFilterFrequence] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterActif, setFilterActif] = useState('all')

  const [formData, setFormData] = useState({
    nom: '',
    montant: '',
    frequence: 'Mensuel',
    prochaine_echeance: '',
    rappel: true,
    icone: 'RefreshCw',
    couleur: '#3B82F6',
    id_compte: '',
    auto_renouvellement: false
  })
  const [errors, setErrors] = useState({})

  const iconOptions = [
    { name: 'RefreshCw', component: RefreshCw, label: t('abonnements.icons.general') },
    { name: 'Tv', component: Tv, label: t('abonnements.icons.streaming') },
    { name: 'Music', component: Music, label: t('abonnements.icons.music') },
    { name: 'Smartphone', component: Smartphone, label: t('abonnements.icons.mobile') },
    { name: 'Cloud', component: Cloud, label: t('abonnements.icons.cloud') },
    { name: 'Gamepad2', component: Gamepad2, label: t('abonnements.icons.gaming') },
    { name: 'Car', component: Car, label: t('abonnements.icons.automobile') },
    { name: 'Heart', component: Heart, label: t('abonnements.icons.health') },
    { name: 'Zap', component: Zap, label: t('abonnements.icons.energy') }
  ]

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ]

  const frequenceOptions = [
    t('abonnements.frequencies.monthly'),
    t('abonnements.frequencies.quarterly'),
    t('abonnements.frequencies.semiannual'),
    t('abonnements.frequencies.annual')
  ]

  // Calculs automatiques
  const updateAbonnementsStatus = () => {
    const today = new Date()
    return abonnements.map(ab => {
      const echeance = new Date(ab.prochaine_echeance)
      const diffTime = echeance - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let statut = t('abonnements.status.current')
      if (diffDays < 0) {
        statut = t('abonnements.status.expired')
      } else if (diffDays <= 7) {
        statut = t('abonnements.status.expiringSoon')
      }
      
      return {
        ...ab,
        jours_restants: diffDays,
        statut
      }
    })
  }

  useEffect(() => {
    const load = async () => {
      if (!user?.id_user) return
      try {
        setLoading(true)
        setError('')
        // Charger l'historique de renouvellement (date ISO par abonnement)
        try {
          const rawHist = localStorage.getItem('abos-renewed-history')
          if (rawHist) setRenewedHistory(JSON.parse(rawHist))
        } catch (_e) {}
        const data = await abonnementsService.listByUser(user.id_user, { includeInactive: true })
        const normalized = Array.isArray(data) ? data.map(row => ({
          id_abonnement: row.id_abonnement,
          id_user: row.id_user,
          nom: row.nom,
          montant: Number(row.montant) || 0,
          frequence: row['fréquence'] || row.frequence || 'Mensuel',
          prochaine_echeance: row.prochaine_echeance,
          rappel: !!row.rappel,
          icone: row.icon || 'RefreshCw',
          couleur: row.couleur || '#3B82F6',
          id_compte: row.id_compte || null,
          auto_renouvellement: !!row.auto_renouvellement,
          date_dernier_renouvellement: row.date_dernier_renouvellement || null,
          actif: (row.actif == null ? 1 : Number(row.actif)) === 1
        })) : []
        setAbonnements(normalized.map(ab => ({...ab, ...computeStatus(ab)})))
        // Charger les comptes pour connaître les devises associées
        try {
          const res = await accountsService.getMyAccounts()
          if (res.success) setComptes(Array.isArray(res.data) ? res.data : [])
        } catch (_e) {}
      } catch (e) {
        const errorMessage = e?.message || t('abonnements.errors.loadError')
        setError(errorMessage)
        showError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id_user])

  const computeStatus = (ab) => {
    const today = new Date()
    const echeance = new Date(ab.prochaine_echeance)
    const diffTime = echeance - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    let statut = t('abonnements.status.current')
    if (diffDays < 0) statut = t('abonnements.status.expired')
    else if (diffDays <= 7) statut = t('abonnements.status.expiringSoon')
    return { jours_restants: diffDays, statut }
  }

  // Calculs statistiques
  const totalAbonnements = abonnements.length
  const abonnementsActifs = abonnements.filter(ab => ab.statut === t('abonnements.status.current') || ab.statut === 'Actuel').length
  const abonnementsExpires = abonnements.filter(ab => ab.statut === t('abonnements.status.expired') || ab.statut === 'Expiré').length
  const abonnementsProches = abonnements.filter(ab => ab.statut === t('abonnements.status.expiringSoon') || ab.statut === 'Expire bientôt').length
  const coutMensuelTotal = abonnements.reduce((sum, ab) => {
    if (!ab.actif) return sum
    const monthly = t('abonnements.frequencies.monthly')
    const quarterly = t('abonnements.frequencies.quarterly')
    const semiannual = t('abonnements.frequencies.semiannual')
    const annual = t('abonnements.frequencies.annual')
    if (ab.frequence === 'Mensuel' || ab.frequence === monthly) return sum + ab.montant
    if (ab.frequence === 'Trimestriel' || ab.frequence === quarterly) return sum + (ab.montant / 3)
    if (ab.frequence === 'Semestriel' || ab.frequence === semiannual) return sum + (ab.montant / 6)
    if (ab.frequence === 'Annuel' || ab.frequence === annual) return sum + (ab.montant / 12)
    return sum
  }, 0)
  const coutAnnuelTotal = coutMensuelTotal * 12

  // Données pour les graphiques
  const repartitionData = [
    { name: t('abonnements.statistics.active'), value: abonnementsActifs, color: '#10B981' },
    { name: t('abonnements.statistics.expiringSoon'), value: abonnementsProches, color: '#F59E0B' },
    { name: t('abonnements.statistics.expired'), value: abonnementsExpires, color: '#EF4444' }
  ]

  const coutParFrequence = frequenceOptions.map(freq => ({
    frequence: freq,
    nombre: abonnements.filter(ab => ab.frequence === freq).length,
    cout: abonnements
      .filter(ab => ab.frequence === freq)
      .reduce((sum, ab) => sum + ab.montant, 0)
  }))

  const evolutionData = [
    { mois: 'Oct', cout: 45.97 },
    { mois: 'Nov', cout: 53.96 },
    { mois: 'Déc', cout: 53.96 },
    { mois: 'Jan', cout: coutMensuelTotal }
  ]

  // Filtrage des abonnements
  const filteredAbonnements = abonnements.filter(abonnement => {
    const matchesSearch = abonnement.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFrequence = !filterFrequence || abonnement.frequence === filterFrequence
    const matchesStatut = !filterStatut || abonnement.statut === filterStatut
    const matchesActif = filterActif === 'all'
      ? true
      : filterActif === 'active'
        ? abonnement.actif
        : !abonnement.actif
    return matchesSearch && matchesFrequence && matchesStatut && matchesActif
  })

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nom || formData.nom.trim() === '') {
      newErrors.nom = t('abonnements.errors.nameRequired')
    }
    
    if (!formData.montant || formData.montant.trim() === '') {
      newErrors.montant = t('abonnements.errors.amountRequired')
    } else {
      const montant = parseFloat(formData.montant)
      if (isNaN(montant) || montant <= 0) {
        newErrors.montant = t('abonnements.errors.amountInvalid')
      }
    }
    
    if (!formData.prochaine_echeance || formData.prochaine_echeance.trim() === '') {
      newErrors.prochaine_echeance = t('abonnements.errors.dueDateRequired')
    }
    
    if (!formData.frequence || formData.frequence.trim() === '') {
      newErrors.frequence = t('abonnements.errors.frequencyRequired')
    }
    
    if (!formData.id_compte || formData.id_compte.trim() === '') {
      newErrors.id_compte = t('abonnements.errors.accountRequired')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }
    
    try {
      if (editingAbonnement) {
        await abonnementsService.update(editingAbonnement.id_abonnement, {
          nom: formData.nom,
          montant: parseFloat(formData.montant),
          frequence: formData.frequence,
          prochaine_echeance: formData.prochaine_echeance,
          rappel: formData.rappel ? 1 : 0,
          icon: formData.icone,
          couleur: formData.couleur,
          id_compte: formData.id_compte || null,
          auto_renouvellement: !!formData.auto_renouvellement
        })
        showSuccess(t('abonnements.success.updated'))
      } else {
        await abonnementsService.create({
          id_user: user.id_user,
          nom: formData.nom,
          montant: parseFloat(formData.montant),
          frequence: formData.frequence,
          prochaine_echeance: formData.prochaine_echeance,
          rappel: formData.rappel ? 1 : 0,
          icon: formData.icone,
          couleur: formData.couleur,
          id_compte: formData.id_compte || null,
          auto_renouvellement: !!formData.auto_renouvellement
        })
        showSuccess(t('abonnements.success.created'))
      }
      const data = await abonnementsService.listByUser(user.id_user, { includeInactive: true })
      const normalized = Array.isArray(data) ? data.map(row => ({
        id_abonnement: row.id_abonnement,
        id_user: row.id_user,
        nom: row.nom,
        montant: Number(row.montant) || 0,
        frequence: row['fréquence'] || row.frequence || 'Mensuel',
        prochaine_echeance: row.prochaine_echeance,
        rappel: !!row.rappel,
        icone: row.icon || 'RefreshCw',
        couleur: row.couleur || '#3B82F6',
        id_compte: row.id_compte || null,
        auto_renouvellement: !!row.auto_renouvellement,
        actif: (row.actif == null ? 1 : Number(row.actif)) === 1
      })) : []
      setAbonnements(normalized.map(ab => ({...ab, ...computeStatus(ab)})))
      resetForm()
    } catch (e) {
      const errorMessage = e?.message || t('abonnements.errors.saveError')
      showError(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      montant: '',
      frequence: t('abonnements.frequencies.monthly'),
      prochaine_echeance: '',
      rappel: true,
      icone: 'RefreshCw',
      couleur: '#3B82F6',
      id_compte: '',
      auto_renouvellement: false
    })
    setErrors({})
    setEditingAbonnement(null)
    setIsModalOpen(false)
  }

  const handleEdit = (abonnement) => {
    setEditingAbonnement(abonnement)
    setErrors({})
    setFormData({
      nom: abonnement.nom,
      montant: abonnement.montant.toString(),
      frequence: abonnement.frequence,
      prochaine_echeance: abonnement.prochaine_echeance,
      rappel: abonnement.rappel,
      icone: abonnement.icone,
      couleur: abonnement.couleur,
      id_compte: abonnement.id_compte || '',
      auto_renouvellement: !!abonnement.auto_renouvellement
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await abonnementsService.remove(id)
      showSuccess(t('abonnements.success.deleted'))
      setAbonnements(abonnements.filter(ab => ab.id_abonnement !== id))
    } catch (e) {
      const errorMessage = e?.message || t('abonnements.errors.deleteError')
      showError(errorMessage)
    }
  }

  const toggleRappel = (id) => {
    setAbonnements(abonnements.map(ab =>
      ab.id_abonnement === id
        ? { ...ab, rappel: !ab.rappel }
        : ab
    ))
  }

  const getStatutStyle = (statut) => {
    const current = t('abonnements.status.current')
    const expiringSoon = t('abonnements.status.expiringSoon')
    const expired = t('abonnements.status.expired')
    if (statut === 'Actuel' || statut === current) {
      return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900', icon: CheckCircle }
    } else if (statut === 'Expire bientôt' || statut === expiringSoon) {
      return { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900', icon: AlertTriangle }
    } else if (statut === 'Expiré' || statut === expired) {
      return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900', icon: Clock }
    }
    return { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', icon: RefreshCw }
  }

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(option => option.name === iconName)
    return iconOption ? iconOption.component : RefreshCw
  }

  const getProchainPaiement = (frequence, dateActuelle) => {
    const date = new Date(dateActuelle)
    switch (frequence) {
      case 'Mensuel':
        date.setMonth(date.getMonth() + 1)
        break
      case 'Trimestriel':
        date.setMonth(date.getMonth() + 3)
        break
      case 'Semestriel':
        date.setMonth(date.getMonth() + 6)
        break
      case 'Annuel':
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    return date.toISOString().split('T')[0]
  }

  const getCurrencySymbolForAbonnement = (abonnement) => {
    // 1) Si un compte est lié et connu, utiliser sa devise
    if (abonnement?.id_compte && Array.isArray(comptes) && comptes.length > 0) {
      const c = comptes.find(x => (x.id_compte || x.id) === abonnement.id_compte)
      const sym = c?.currencySymbol || resolveCurrencySymbol(c?.devise || c?.currency)
      if (sym) return sym
    }
    // 2) Essayer un champ devise/currency sur l'abonnement si existant
    const sym2 = resolveCurrencySymbol(abonnement?.devise || abonnement?.currency)
    if (sym2) return sym2
    // 3) Par défaut euro
    return '€'
  }

  const getCurrencyCodeForAbonnement = (abonnement) => {
    if (abonnement?.id_compte && Array.isArray(comptes) && comptes.length > 0) {
      const c = comptes.find(x => (x.id_compte || x.id) === abonnement.id_compte)
      return (c?.devise || c?.currency || '').toString().toUpperCase()
    }
    return (abonnement?.devise || abonnement?.currency || '').toString().toUpperCase()
  }

  const formatAmountForAbonnement = (abonnement) => {
    const code = getCurrencyCodeForAbonnement(abonnement)
    const symbol = getCurrencySymbolForAbonnement(abonnement)
    const decimals = (symbol === 'Ar' || code === 'MGA') ? 0 : 2
    const num = Number(abonnement.montant) || 0
    const hasFraction =
      decimals > 0 &&
      Math.abs(num - Math.trunc(num)) > Number.EPSILON
    const locale = getLocaleFromLanguage(currentLanguage)
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: hasFraction ? decimals : 0,
      maximumFractionDigits: hasFraction ? decimals : 0,
      useGrouping: true
    }).format(num)
    return `${formattedNumber} ${symbol}`
  }

  const resolveCurrencySymbol = (deviseLike) => {
    const d = (deviseLike || '').toString().toUpperCase()
    if (!d) return ''
    if (d === 'MGA') return 'Ar'
    if (d === 'EUR') return '€'
    if (d === 'USD') return '$'
    if (d === 'GBP') return '£'
    return d
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('abonnements.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('abonnements.subtitle')}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            <Plus className="w-5 h-5" />
            {t('abonnements.newSubscription')}
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.statistics.total')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAbonnements}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.statistics.active')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{abonnementsActifs}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.statistics.expiringSoon')}</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{abonnementsProches}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.statistics.monthlyCost')}</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{coutMensuelTotal.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.statistics.annualCost')}</p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{coutAnnuelTotal.toFixed(0)}</p>
              </div>
              <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques supprimés */}

      {/* Filtres et Recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={t('abonnements.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filterFrequence}
            onChange={(e) => setFilterFrequence(e.target.value)}
          >
            <option value="">{t('abonnements.allFrequencies')}</option>
            {frequenceOptions.map(freq => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="">{t('abonnements.allStatuses')}</option>
            <option value={t('abonnements.status.current')}>{t('abonnements.statistics.active')}</option>
            <option value={t('abonnements.status.expiringSoon')}>{t('abonnements.statistics.expiringSoon')}</option>
            <option value={t('abonnements.status.expired')}>{t('abonnements.statistics.expired')}</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value)}
          >
            <option value="all">{t('abonnements.stateFilter.all')}</option>
            <option value="active">{t('abonnements.stateFilter.active')}</option>
            <option value="inactive">{t('abonnements.stateFilter.inactive')}</option>
          </select>

          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('abonnements.export')}
          </button>
        </div>
      </div>

      {/* Liste des Abonnements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAbonnements.map((abonnement) => {
          const status = getStatutStyle(abonnement.statut)
          const StatusIcon = status.icon
          const IconComponent = getIconComponent(abonnement.icone)
          const monthLabel = formatSubscriptionMonth(abonnement.prochaine_echeance, currentLanguage)
          
          return (
            <div key={abonnement.id_abonnement} className={`rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow ${abonnement.actif ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${abonnement.couleur}20` }}
                  >
                    <IconComponent 
                      className="w-6 h-6" 
                      style={{ color: abonnement.couleur }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{abonnement.nom}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRappel(abonnement.id_abonnement)}
                    className={`p-2 rounded-lg transition-colors ${
                      abonnement.rappel 
                        ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900 hover:bg-yellow-100 dark:hover:bg-yellow-800' 
                        : 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    title={abonnement.rappel ? t('abonnements.disableReminder') : t('abonnements.enableReminder')}
                  >
                    {abonnement.rappel ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(abonnement)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const nextActif = !abonnement.actif
                        await abonnementsService.setActive(abonnement.id_abonnement, nextActif)
                        setAbonnements(prev => prev.map(x => x.id_abonnement === abonnement.id_abonnement ? { ...x, actif: nextActif } : x))
                        showSuccess(nextActif ? t('abonnements.success.statusEnabled') : t('abonnements.success.statusDisabled'))
                      } catch (e) {
                        alert(e?.message || t('abonnements.errors.statusChangeError'))
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${abonnement.actif ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    title={abonnement.actif ? t('abonnements.disable') : t('abonnements.enable')}
                  >
                    {abonnement.actif ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => { setDeleteTarget(abonnement); setIsDeleteModalOpen(true) }}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                    title={t('abonnements.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informations */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.fields.amount')}</span>
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">{formatAmountForAbonnement(abonnement)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.fields.frequency')}</span>
                  <span className="text-sm font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-900 dark:text-white">
                    {abonnement.frequence}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.fields.subscriptionMonth')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {monthLabel || '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.fields.nextDueDate')}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(abonnement.prochaine_echeance).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('abonnements.fields.timeRemaining')}</span>
                  <span className={`text-sm font-medium ${
                    abonnement.jours_restants < 0 ? 'text-red-600 dark:text-red-400' :
                    abonnement.jours_restants <= 7 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {abonnement.jours_restants < 0 
                      ? t('abonnements.fields.expiredDaysAgo').replace('{days}', Math.abs(abonnement.jours_restants))
                      : abonnement.jours_restants === 0 
                      ? t('abonnements.fields.today')
                      : `${abonnement.jours_restants} ${t('abonnements.fields.days')}`
                    }
                  </span>
                </div>
              </div>

              {/* Statut */}
              <div className={`flex items-center justify-between gap-2 p-3 rounded-lg ${abonnement.actif ? status.bg : 'bg-red-100 dark:bg-red-900'}`}>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${abonnement.actif ? status.color : 'text-red-700 dark:text-red-300'}`} />
                  <span className={`text-sm font-medium ${abonnement.actif ? status.color : 'text-red-700 dark:text-red-300'}`}>
                    {abonnement.statut}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${abonnement.actif ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'}`}>
                  {abonnement.actif ? t('abonnements.active') : t('abonnements.inactive')}
                </span>
              </div>

              {/* Actions rapides */}
              {!abonnement.actif ? (
                <div className="w-full mt-3 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t('abonnements.renewalDisabled')}
                </div>
              ) : abonnement.auto_renouvellement ? (
                <div className="w-full mt-3 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t('abonnements.autoRenewalEnabled')}
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setRenewTarget(abonnement)
                      setIsRenewModalOpen(true)
                      setLoadingComptes(true)
                      setSelectedCompteId(abonnement.id_compte || null)
                      const res = await accountsService.getMyAccounts()
                      if (res.success) {
                        setComptes(Array.isArray(res.data) ? res.data : [])
                        if (!abonnement.id_compte && Array.isArray(res.data) && res.data.length > 0) {
                          setSelectedCompteId(res.data[0].id_compte || res.data[0].id)
                        }
                      } else {
                        alert(res.error || t('abonnements.errors.loadAccountsError'))
                      }
                    } catch (e) {
                      alert(e?.message || t('abonnements.errors.loadAccountsError'))
                    } finally {
                      setLoadingComptes(false)
                    }
                  }}
                  className="w-full mt-3 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  <RefreshCw className="w-4 h-4" />
                  {(abonnement.statut === 'Expiré' || abonnement.statut === t('abonnements.status.expired')) ? t('abonnements.renew') : t('abonnements.renewNow')}
                </button>
              )}

              {/* Badge de dernier renouvellement: backend si dispo, sinon historique local */}
              {(() => {
                const iso = abonnement.date_dernier_renouvellement || renewedHistory[abonnement.id_abonnement]
                if (!iso) return null
                const d = new Date(iso)
                const formatted = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                return (
                  <div className={`mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${abonnement.actif ? 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                    <CheckCircle className="w-3 h-3" /> {t('abonnements.renewedOn')} {formatted}
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>

      {filteredAbonnements.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('abonnements.noSubscriptions')}</p>
        </div>
      )}

      {/* Modal de renouvellement: choix du compte */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar scroll-smooth">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('abonnements.selectAccountToDebit')}</h2>
            {renewTarget && (
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                {(() => {
                  const selected = Array.isArray(comptes) ? comptes.find(c => (c.id_compte || c.id) === selectedCompteId) : null
                  const symbol = selected?.currencySymbol || resolveCurrencySymbol(selected?.devise || selected?.currency) || '€'
                  const amount = Number(renewTarget.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  return (
                    <>
                      {t('abonnements.subscription')} <span className="font-medium">{renewTarget.nom}</span> • {t('abonnements.amountLabel')} <span className="font-medium">{amount} {symbol}</span>
                    </>
                  )
                })()}
              </div>
            )}
            {loadingComptes ? (
              <div className="text-gray-500 dark:text-gray-400">{t('abonnements.loadingAccounts')}</div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(comptes) && comptes.length > 0 ? (
                  comptes.map((c) => (
                    <label key={c.id_compte || c.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="compte"
                          checked={selectedCompteId === (c.id_compte || c.id)}
                          onChange={() => setSelectedCompteId(c.id_compte || c.id)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{c.nom || c.name || `Compte ${c.id_compte || c.id}`}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Solde: {(parseFloat(c.solde) || 0).toFixed(2)}• {c.type || ''}</div>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('abonnements.noAccountsAvailable')}</div>
                )}
              </div>
            )}

            {/* Nombre de périodes à renouveler */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('abonnements.numberOfPeriods')}
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={selectedPeriods}
                onChange={(e) => setSelectedPeriods(Math.max(1, Math.min(24, parseInt(e.target.value || '1', 10))))}
                className="w-28 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('abonnements.periodDescription')}
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={() => { setIsRenewModalOpen(false); setRenewTarget(null) }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors"
              >
                {t('abonnements.cancel')}
              </button>
              <button
                type="button"
                disabled={!selectedCompteId}
                onClick={async () => {
                  if (!renewTarget || !selectedCompteId) return
                  try {
                    let lastProchaine = null
                    for (let i = 0; i < (selectedPeriods || 1); i++) {
                      const res = await abonnementsService.renew({ id_abonnement: renewTarget.id_abonnement, id_compte: selectedCompteId })
                      if (res && res.prochaine_echeance) {
                        lastProchaine = res.prochaine_echeance
                      }
                    }
                    // Enregistrer la vraie date de renouvellement (aujourd'hui)
                    setRenewedHistory(prev => {
                      const next = { ...prev, [renewTarget.id_abonnement]: new Date().toISOString() }
                      try { localStorage.setItem('abos-renewed-history', JSON.stringify(next)) } catch (_e) {}
                      return next
                    })
                    const data = await abonnementsService.listByUser(user.id_user, { includeInactive: true })
                    const normalized = Array.isArray(data) ? data.map(row => ({
                      id_abonnement: row.id_abonnement,
                      id_user: row.id_user,
                      nom: row.nom,
                      montant: Number(row.montant) || 0,
                      frequence: row['fréquence'] || row.frequence || t('abonnements.frequencies.monthly'),
                      prochaine_echeance: row.prochaine_echeance,
                      rappel: !!row.rappel,
                      icone: row.icon || 'RefreshCw',
                      couleur: row.couleur || '#3B82F6',
                      id_compte: row.id_compte || null,
                      auto_renouvellement: !!row.auto_renouvellement,
                      date_dernier_renouvellement: row.date_dernier_renouvellement || null,
                      actif: (row.actif == null ? 1 : Number(row.actif)) === 1
                    })) : []
                    setAbonnements(normalized.map(ab => ({...ab, ...computeStatus(ab)})))
                    showSuccess(selectedPeriods > 1 ? t('abonnements.success.renewedPeriods').replace('{periods}', selectedPeriods) : t('abonnements.success.renewed'))
                    setIsRenewModalOpen(false)
                    setRenewTarget(null)
                    setSelectedPeriods(1)
                  } catch (e) {
                    const errorMessage = e?.message || t('abonnements.errors.renewalError')
                    showError(errorMessage)
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200 ${!selectedCompteId ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: colors.secondary }}
                onMouseEnter={(e) => { if (selectedCompteId) e.target.style.backgroundColor = colors.secondaryDark }}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
              >
                {t('abonnements.confirmRenewal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar scroll-smooth">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {editingAbonnement ? t('abonnements.editSubscription') : t('abonnements.newSubscription')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('abonnements.subscriptionName')}
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.nom 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-green-500'
                  }`}
                  value={formData.nom}
                  onChange={(e) => {
                    setFormData({...formData, nom: e.target.value})
                    if (errors.nom) {
                      setErrors({...errors, nom: ''})
                    }
                  }}
                  placeholder={t('abonnements.subscriptionNamePlaceholder')}
                />
                {errors.nom && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('abonnements.amount')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.montant 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-green-500'
                  }`}
                  value={formData.montant}
                  onChange={(e) => {
                    setFormData({...formData, montant: e.target.value})
                    if (errors.montant) {
                      setErrors({...errors, montant: ''})
                    }
                  }}
                  placeholder="0.00"
                />
                {errors.montant && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.montant}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('abonnements.frequency')}
                </label>
                <select
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.frequence 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-green-500'
                  }`}
                  value={formData.frequence}
                  onChange={(e) => {
                    setFormData({...formData, frequence: e.target.value})
                    if (errors.frequence) {
                      setErrors({...errors, frequence: ''})
                    }
                  }}
                >
                  {frequenceOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
                {errors.frequence && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.frequence}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('abonnements.nextDueDate')}
                </label>
                <input
                  type="date"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.prochaine_echeance 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-green-500'
                  }`}
                  value={formData.prochaine_echeance}
                  onChange={(e) => {
                    setFormData({...formData, prochaine_echeance: e.target.value})
                    if (errors.prochaine_echeance) {
                      setErrors({...errors, prochaine_echeance: ''})
                    }
                  }}
                />
                {errors.prochaine_echeance && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.prochaine_echeance}</p>
                )}
              </div>

              {/* Compte lié pour le prélèvement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('abonnements.debitAccount')}
                </label>
                <select
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.id_compte 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-200 dark:border-gray-600 focus:ring-green-500'
                  }`}
                  value={formData.id_compte}
                  onChange={(e) => {
                    setFormData({ ...formData, id_compte: e.target.value })
                    if (errors.id_compte) {
                      setErrors({...errors, id_compte: ''})
                    }
                  }}
                  onFocus={async () => {
                    if (!Array.isArray(comptes) || comptes.length === 0) {
                      try {
                        setLoadingComptes(true)
                        const res = await accountsService.getMyAccounts()
                        if (res.success) setComptes(Array.isArray(res.data) ? res.data : [])
                      } catch (_e) {
                        // noop
                      } finally {
                        setLoadingComptes(false)
                      }
                    }
                  }}
                >
                  <option value="">{t('abonnements.selectAccount')}</option>
                  {Array.isArray(comptes) && comptes.map(c => (
                    <option key={c.id_compte || c.id} value={c.id_compte || c.id}>
                      {(c.nom || c.name || `Compte ${c.id_compte || c.id}`)}
                    </option>
                  ))}
                </select>
                {errors.id_compte && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.id_compte}</p>
                )}
                {loadingComptes && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('abonnements.loadingAccounts')}</div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                    checked={formData.rappel}
                    onChange={(e) => setFormData({...formData, rappel: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('abonnements.enableReminders')}
                  </span>
                </label>
              </div>

              {/* Auto-renouvellement */}
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                    checked={!!formData.auto_renouvellement}
                    onChange={(e) => setFormData({ ...formData, auto_renouvellement: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('abonnements.enableAutoRenewal')}
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('abonnements.autoRenewalDescription')}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors"
                >
                  {t('abonnements.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {editingAbonnement ? t('abonnements.modify') : t('abonnements.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* (Modal de test email retirée) */}
      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('abonnements.confirmDelete')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t('abonnements.deleteMessage').replace('{name}', deleteTarget.nom ? ` "${deleteTarget.nom}"` : '')}
            </p>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null) }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors"
              >
                {t('abonnements.cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deleteTarget.id_abonnement
                  await handleDelete(id)
                  setIsDeleteModalOpen(false)
                  setDeleteTarget(null)
                }}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                style={{ backgroundColor: '#ef4444' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                {t('abonnements.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}