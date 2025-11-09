"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { colors } from '@/styles/colors'
import { 
  BellRing,
  Save,
  AlertTriangle,
  Edit2,
  X,
  Plus,
  Trash2,
  Eye,
  Search,
  BarChart3,
  Settings
} from 'lucide-react'

import alertThresholdsService from '@/services/alertThresholdsService'
import api from '@/services/apiService'
import { useToast } from '@/hooks/useToast'
import { useLanguage } from '@/context/LanguageContext'

const SectionCard = ({ title, children, actions = null }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        {actions}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

// DOMAINS will be created dynamically using translations

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', onConfirm, onCancel, loading = false, danger = false, pleaseWait = 'Veuillez patienter…' }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
          <div className="flex justify-end space-x-2">
            <button onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">{cancelLabel}</button>
            <button onClick={onConfirm} disabled={loading} className={`px-6 py-2 rounded-lg text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>{loading ? pleaseWait : confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Suppression des listes par catégorie/compte : chaque section ci-dessous
// expose désormais un seuil global unique (entrée simple + enregistrer/réinitialiser).

export default function AlertesPage({ params }) {
  const { locale } = params || {}
  const { t } = useLanguage()
  const { showSuccess, showError } = useToast()
  const [userId, setUserId] = useState(null)

  const DOMAINS = useMemo(() => [
    { key: 'solde', label: t('alertes.domains.solde') },
    { key: 'comptes', label: t('alertes.domains.comptes') },
    { key: 'depenses', label: t('alertes.domains.depenses') },
    { key: 'budget', label: t('alertes.domains.budget') },
    { key: 'objectifs', label: t('alertes.domains.objectifs') }
  ], [t])

  // Formulaire seuil d'alerte global (exemple: solde)
  const [globalThreshold, setGlobalThreshold] = useState(2000)
  const [savedThreshold, setSavedThreshold] = useState(2000)

  const thresholdInfo = useMemo(() => {
    if (globalThreshold === 2000) {
      return 'Exemple: si votre solde alerte est 2000, le formulaire est pré-rempli à 2000.'
    }
    return null
  }, [globalThreshold])

  // Seuils globaux par domaine
  const [accountsThreshold, setAccountsThreshold] = useState(1000)
  const [savedAccountsThreshold, setSavedAccountsThreshold] = useState(1000)

  const [expensesThreshold, setExpensesThreshold] = useState(500)
  const [savedExpensesThreshold, setSavedExpensesThreshold] = useState(500)

  const [budgetThreshold, setBudgetThreshold] = useState(1500)
  const [savedBudgetThreshold, setSavedBudgetThreshold] = useState(1500)

  const [objectivesThreshold, setObjectivesThreshold] = useState(2000)
  const [savedObjectivesThreshold, setSavedObjectivesThreshold] = useState(2000)

  // Modal d'édition via tableau récapitulatif
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalDomain, setModalDomain] = useState(null)
  const [modalValue, setModalValue] = useState(0)
  const [modalInfo, setModalInfo] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [existingDomains, setExistingDomains] = useState(new Set())
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [thresholdsRaw, setThresholdsRaw] = useState([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmDomain, setConfirmDomain] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Pagination du tableau
  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)

  // Recherche
  const [search, setSearch] = useState('')

  // Informations sauvegardées par domaine
  const [infoSolde, setInfoSolde] = useState('')
  const [infoComptes, setInfoComptes] = useState('')
  const [infoDepenses, setInfoDepenses] = useState('')
  const [infoBudget, setInfoBudget] = useState('')
  const [infoObjectifs, setInfoObjectifs] = useState('')

  // UI state
  const [selectedDomain, setSelectedDomain] = useState('solde')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const loadThresholds = async (uid) => {
    try {
      setLoading(true)
      setLoadError('')
      const thresholds = await alertThresholdsService.listByUser(uid)
      if (!Array.isArray(thresholds)) return
      setThresholdsRaw(thresholds)
      const domains = new Set()
      thresholds.forEach((t) => {
        if (t?.domain) domains.add(t.domain)
        switch (t.domain) {
          case 'solde':
            setSavedThreshold(Number(t.value)); setGlobalThreshold(Number(t.value)); setInfoSolde(t.info || '');
            break
          case 'comptes':
            setSavedAccountsThreshold(Number(t.value)); setAccountsThreshold(Number(t.value)); setInfoComptes(t.info || '');
            break
          case 'depenses':
            setSavedExpensesThreshold(Number(t.value)); setExpensesThreshold(Number(t.value)); setInfoDepenses(t.info || '');
            break
          case 'budget':
            setSavedBudgetThreshold(Number(t.value)); setBudgetThreshold(Number(t.value)); setInfoBudget(t.info || '');
            break
          case 'objectifs':
            setSavedObjectivesThreshold(Number(t.value)); setObjectivesThreshold(Number(t.value)); setInfoObjectifs(t.info || '');
            break
        }
      })
      setExistingDomains(domains)
    } catch (e) {
      setLoadError(e?.message || t('alertes.errors.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const rows = useMemo(() => ([
    { key: 'solde', label: t('alertes.domains.soldeGlobal'), value: savedThreshold, info: infoSolde },
    { key: 'comptes', label: t('alertes.domains.comptes'), value: savedAccountsThreshold, info: infoComptes },
    { key: 'depenses', label: t('alertes.domains.depenses'), value: savedExpensesThreshold, info: infoDepenses },
    { key: 'budget', label: t('alertes.domains.budget'), value: savedBudgetThreshold, info: infoBudget },
    { key: 'objectifs', label: t('alertes.domains.objectifs'), value: savedObjectivesThreshold, info: infoObjectifs },
  ]), [savedThreshold, savedAccountsThreshold, savedExpensesThreshold, savedBudgetThreshold, savedObjectivesThreshold, infoSolde, infoComptes, infoDepenses, infoBudget, infoObjectifs, t])

  const filteredRows = rows.filter(r => r.label.toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredRows.length)
  const paginatedRows = filteredRows.slice(startIndex, endIndex)

  const openEditModal = (domain) => {
    setModalMode('edit')
    setModalDomain(domain)
    switch (domain) {
      case 'solde':
        setModalValue(globalThreshold)
        setModalInfo(infoSolde)
        break
      case 'comptes':
        setModalValue(accountsThreshold)
        setModalInfo(infoComptes)
        break
      case 'depenses':
        setModalValue(expensesThreshold)
        setModalInfo(infoDepenses)
        break
      case 'budget':
        setModalValue(budgetThreshold)
        setModalInfo(infoBudget)
        break
      case 'objectifs':
        setModalValue(objectivesThreshold)
        setModalInfo(infoObjectifs)
        break
      default:
        setModalValue(0)
        setModalInfo('')
    }
    setIsModalOpen(true)
  }

  const saveModalValue = () => {
    if (!userId) return
    // Save to backend then update UI states
    setIsSaving(true)
    const numericValue = Number(modalValue)
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setIsSaving(false)
      showError(t('alertes.errors.valueMustBePositive'))
      return
    }
    alertThresholdsService.upsert({ id_user: userId, domain: modalDomain, value: numericValue, info: modalInfo })
      .then((result) => {
        console.log('[AlertThresholds] Saved successfully', {
          mode: modalMode,
          userId,
          domain: modalDomain,
          value: numericValue,
          info: modalInfo,
          result
        })
        showSuccess(modalMode === 'create' ? t('alertes.success.created') : t('alertes.success.updated'))
        // reload from backend to ensure freshness
        loadThresholds(userId)
        setExistingDomains((prev) => {
          const next = new Set(prev)
          if (modalDomain) next.add(modalDomain)
          return next
        })
        // update local state after success
        if (modalDomain === 'solde') {
          setGlobalThreshold(numericValue)
          setSavedThreshold(numericValue)
          setInfoSolde(modalInfo)
        }
        if (modalDomain === 'comptes') {
          setAccountsThreshold(numericValue)
          setSavedAccountsThreshold(numericValue)
          setInfoComptes(modalInfo)
        }
        if (modalDomain === 'depenses') {
          setExpensesThreshold(numericValue)
          setSavedExpensesThreshold(numericValue)
          setInfoDepenses(modalInfo)
        }
        if (modalDomain === 'budget') {
          setBudgetThreshold(numericValue)
          setSavedBudgetThreshold(numericValue)
          setInfoBudget(modalInfo)
        }
        if (modalDomain === 'objectifs') {
          setObjectivesThreshold(numericValue)
          setSavedObjectivesThreshold(numericValue)
          setInfoObjectifs(modalInfo)
        }
        setIsModalOpen(false)
        setModalDomain(null)
      })
      .catch((e) => {
        showError(e.message || t('alertes.errors.saveError'))
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  // Quand on change de domaine dans la modal, pré-remplir automatiquement valeur et info
  useEffect(() => {
    if (!modalDomain) return
    if (modalDomain === 'solde') { setModalValue(savedThreshold || 0); setModalInfo(infoSolde || '') }
    if (modalDomain === 'comptes') { setModalValue(savedAccountsThreshold || 0); setModalInfo(infoComptes || '') }
    if (modalDomain === 'depenses') { setModalValue(savedExpensesThreshold || 0); setModalInfo(infoDepenses || '') }
    if (modalDomain === 'budget') { setModalValue(savedBudgetThreshold || 0); setModalInfo(infoBudget || '') }
    if (modalDomain === 'objectifs') { setModalValue(savedObjectivesThreshold || 0); setModalInfo(infoObjectifs || '') }
  }, [modalDomain, savedThreshold, savedAccountsThreshold, savedExpensesThreshold, savedBudgetThreshold, savedObjectivesThreshold, infoSolde, infoComptes, infoDepenses, infoBudget, infoObjectifs])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const me = await api.getCurrentUser()
        if (!mounted) return
        const uid = (
          me?.user?.id_user || me?.user?.id ||
          me?.id_user || me?.idUser || me?.userId || me?.id
        )
        if (!uid) return
        setUserId(uid)
        if (!mounted) return
        await loadThresholds(uid)
      } catch (e) {
        // ignore silently or show toast
      }
    })()
    return () => { mounted = false }
  }, [])

  const domainLabel = (key) => {
    const found = DOMAINS.find(d => d.key === key)
    return found ? found.label : key
  }

  const getModalTitle = () => {
    const isCreate = modalMode === 'create'
    if (modalDomain === 'solde') return isCreate ? t('alertes.modal.addSolde') : t('alertes.modal.editSolde')
    if (modalDomain === 'comptes') return isCreate ? t('alertes.modal.addComptes') : t('alertes.modal.editComptes')
    if (modalDomain === 'depenses') return isCreate ? t('alertes.modal.addDepenses') : t('alertes.modal.editDepenses')
    if (modalDomain === 'budget') return isCreate ? t('alertes.modal.addBudget') : t('alertes.modal.editBudget')
    if (modalDomain === 'objectifs') return isCreate ? t('alertes.modal.addObjectifs') : t('alertes.modal.editObjectifs')
    return isCreate ? t('alertes.modal.addThreshold') : t('alertes.modal.editThreshold')
  }

  // Calculs statistiques
  const totalThresholds = thresholdsRaw.length
  const activeThresholds = thresholdsRaw.filter(t => Number(t.value) > 0).length
  const totalValue = thresholdsRaw.reduce((sum, t) => sum + (Number(t.value) || 0), 0)
  const averageValue = totalThresholds > 0 ? totalValue / totalThresholds : 0

  return (
    <div className="min-h-screen p-4 sm:p-6" >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('alertes.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{t('alertes.subtitle')}</p>
          </div>
        </div>

        {!userId && (
          <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
            {t('alertes.notConnected')}
          </div>
        )}
        {loadError && (
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {loadError}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('alertes.statistics.totalThresholds')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalThresholds}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <BellRing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('alertes.statistics.activeThresholds')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeThresholds}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('alertes.statistics.totalValue')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('alertes.statistics.averageValue')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                <Settings className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('alertes.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <SectionCard
          title={t('alertes.thresholdsTitle')}
          actions={(
            <div className="flex items-center space-x-2">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white"
              >
                {DOMAINS.map(d => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setModalMode('create')
                  setModalDomain(selectedDomain)
                  setModalValue('')
                  setModalInfo('')
                  setIsModalOpen(true)
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{existingDomains.has(selectedDomain) ? t('alertes.editThreshold') : t('alertes.createThreshold')}</span>
              </button>
              <button
                onClick={() => userId && loadThresholds(userId)}
                disabled={!userId || loading}
                className={`px-3 py-2 rounded-md border ${(!userId || loading) ? 'text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'}`}
              >
                {loading ? t('alertes.loading') : t('alertes.reload')}
              </button>
            </div>
          )}
        >
          {!userId ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('alertes.connectToView')}</div>
          ) : thresholdsRaw.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('alertes.noThresholdsFound')}</div>
          ) : (
            <>
              <div className="overflow-x-auto custom-scrollbar scroll-smooth">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                    <tr>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{t('alertes.table.domain')}</th>
                      <th className="text-right p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{t('alertes.table.notificationValue')}</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm hidden md:table-cell">{t('alertes.table.message')}</th>
                      <th className="text-center p-3 sm:p-4 font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{t('alertes.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12">
                          <BellRing className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">{t('alertes.noThresholdsFound')}</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row, idx) => {
                        const threshold = thresholdsRaw.find(tr => tr.domain === row.key)
                        if (!threshold) return null
                        return (
                          <tr key={`${row.key}-${idx}`} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                            <td className="p-3 sm:p-4">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">{row.label}</div>
                            </td>
                            <td className="p-3 sm:p-4 text-right">
                              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                {Number(row.value).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4 text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell">
                              <span className="max-w-md truncate block" title={row.info || ''}>
                                {row.info || '-'}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4">
                              <div className="flex items-center justify-center gap-1 sm:gap-2">
                                <button
                                  onClick={async () => {
                                    if (!userId) return
                                    try {
                                      setModalMode('edit')
                                      const one = await alertThresholdsService.getOne(userId, threshold.domain)
                                      setModalDomain(threshold.domain)
                                      setModalValue(Number(one?.value) || 0)
                                      setModalInfo(one?.info || '')
                                      setIsModalOpen(true)
                                    } catch (_e) {
                                      setModalMode('edit')
                                      setModalDomain(threshold.domain)
                                      setModalValue(Number(threshold.value) || 0)
                                      setModalInfo(threshold.info || '')
                                      setIsModalOpen(true)
                                    }
                                  }}
                                  title={t('alertes.edit')}
                                  aria-label={t('alertes.edit')}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setConfirmDomain(threshold.domain); setIsConfirmOpen(true) }}
                                  title={t('alertes.delete')}
                                  aria-label={t('alertes.delete')}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  disabled={!userId}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRows.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('alertes.displaying').replace('{start}', startIndex + 1).replace('{end}', endIndex).replace('{total}', filteredRows.length).replace('{plural}', filteredRows.length > 1 ? 's' : '')}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {t('alertes.previous')}
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            currentPage === page
                              ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {t('alertes.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </SectionCard>
      

   


      


    

      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={getModalTitle()}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('alertes.modal.domain')}</label>
            <select
              value={modalDomain || ''}
              onChange={(e) => setModalDomain(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400"
            >
              {DOMAINS.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('alertes.modal.newThreshold')}</label>
            <input
              type="number"
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              min={0}
              step={0.01}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400"
            />
            {(!(Number.isFinite(Number(modalValue))) || Number(modalValue) <= 0) && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{t('alertes.modal.valueError')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('alertes.modal.information')}</label>
            <textarea
              value={modalInfo}
              onChange={(e) => setModalInfo(e.target.value)}
              placeholder={t('alertes.modal.informationPlaceholder')}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
              disabled={isSaving}
            >
              {t('alertes.modal.cancel')}
            </button>
            <button
              onClick={saveModalValue}
              disabled={isSaving || !modalDomain || !(Number.isFinite(Number(modalValue))) || Number(modalValue) <= 0}
              className={`px-6 py-2 rounded-lg text-white ${isSaving || !modalDomain || !(Number.isFinite(Number(modalValue))) || Number(modalValue) <= 0 ? 'bg-emerald-300 dark:bg-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'}`}
            >
              {isSaving ? t('alertes.modal.saving') : t('alertes.modal.save')}
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t('alertes.confirmDelete.title')}
        message={t('alertes.confirmDelete.message', { domain: domainLabel(confirmDomain || '') })}
        confirmLabel={t('alertes.confirmDelete.confirm')}
        cancelLabel={t('alertes.confirmDelete.cancel')}
        pleaseWait={t('alertes.confirmDelete.pleaseWait')}
        danger
        loading={isDeleting}
        onCancel={() => { if (!isDeleting) { setIsConfirmOpen(false); setConfirmDomain(null) } }}
        onConfirm={async () => {
          if (!userId || !confirmDomain) return
          setIsDeleting(true)
          try {
            await alertThresholdsService.remove(userId, confirmDomain)
            showSuccess(t('alertes.success.deleted'))
            await loadThresholds(userId)
          } catch (e) {
            showError(e?.message || t('alertes.errors.deleteError'))
          } finally {
            setIsDeleting(false)
            setIsConfirmOpen(false)
            setConfirmDomain(null)
          }
        }}
      />
    </div>
  )
}


