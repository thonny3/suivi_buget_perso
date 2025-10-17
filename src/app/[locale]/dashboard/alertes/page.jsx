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
  Eye
} from 'lucide-react'

import alertThresholdsService from '@/services/alertThresholdsService'
import api from '@/services/apiService'
import { useToast } from '@/hooks/useToast'

const SectionCard = ({ title, children, actions = null }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {actions}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

const DOMAINS = [
  { key: 'solde', label: 'Solde' },
  { key: 'comptes', label: 'Comptes' },
  { key: 'depenses', label: 'Dépenses' },
  { key: 'budget', label: 'Budget' },
  { key: 'objectifs', label: 'Objectifs' }
]

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}

const ConfirmModal = ({ isOpen, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', onConfirm, onCancel, loading = false, danger = false }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-700">{message}</p>
          <div className="flex justify-end space-x-2">
            <button onClick={onCancel} disabled={loading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg">{cancelLabel}</button>
            <button onClick={onConfirm} disabled={loading} className={`px-6 py-2 rounded-lg text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>{loading ? 'Veuillez patienter…' : confirmLabel}</button>
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
  const { showSuccess, showError } = useToast()
  const [userId, setUserId] = useState(null)

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
      setLoadError(e?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const rows = useMemo(() => ([
    { key: 'solde', label: 'Solde global', value: savedThreshold, info: infoSolde },
    { key: 'comptes', label: 'Comptes', value: savedAccountsThreshold, info: infoComptes },
    { key: 'depenses', label: 'Dépenses', value: savedExpensesThreshold, info: infoDepenses },
    { key: 'budget', label: 'Budget', value: savedBudgetThreshold, info: infoBudget },
    { key: 'objectifs', label: 'Objectifs', value: savedObjectivesThreshold, info: infoObjectifs },
  ]), [savedThreshold, savedAccountsThreshold, savedExpensesThreshold, savedBudgetThreshold, savedObjectivesThreshold, infoSolde, infoComptes, infoDepenses, infoBudget, infoObjectifs])

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
      showError('La valeur doit être un nombre > 0')
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
        showSuccess(modalMode === 'create' ? 'Seuil créé' : 'Seuil modifié')
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
        showError(e.message || 'Erreur lors de l\'enregistrement')
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

  return (
    <div className="min-h-screen p-6" >
      <div className="max-w-7xl mx-auto space-y-6">
        {!userId && (
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
            Vous n'êtes pas connecté(e). Connectez-vous pour charger et enregistrer les seuils dynamiquement.
          </div>
        )}
        {loadError && (
          <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {loadError}
          </div>
        )}
        <SectionCard
          title="Seuils d'alertes"
          actions={(
            <div className="flex items-center space-x-2">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{existingDomains.has(selectedDomain) ? 'Modifier le seuil' : 'Créer un seuil'}</span>
              </button>
              <button
                onClick={() => userId && loadThresholds(userId)}
                disabled={!userId || loading}
                className={`px-3 py-2 rounded-md border ${(!userId || loading) ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {loading ? 'Chargement...' : 'Recharger'}
              </button>
            </div>
          )}
        >
          {!userId ? (
            <div className="text-sm text-gray-600">Connectez-vous pour voir vos seuils.</div>
          ) : thresholdsRaw.length === 0 ? (
            <div className="text-sm text-gray-600">Aucun seuil trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-gray-500 border-b">Domaine</th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-gray-500 border-b text-right"> Valeur Notifcation</th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-gray-500 border-b">Message</th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-gray-500 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {thresholdsRaw.map((t, idx) => (
                    <tr key={`${t.domain}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">{domainLabel(t.domain)}</td>
                      <td className="px-4 py-3 text-gray-900 text-right font-medium text-center">{Number(t.value)}</td>
                      <td className="px-4 py-3 text-gray-700 text-sm max-w-md truncate" title={t.info || ''}>{t.info || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (!userId) return
                            try {
                              setModalMode('edit')
                              const one = await alertThresholdsService.getOne(userId, t.domain)
                              setModalDomain(t.domain)
                              setModalValue(Number(one?.value) || 0)
                              setModalInfo(one?.info || '')
                              setIsModalOpen(true)
                            } catch (_e) {
                              setModalMode('edit')
                              setModalDomain(t.domain)
                              setModalValue(Number(t.value) || 0)
                              setModalInfo(t.info || '')
                              setIsModalOpen(true)
                            }
                          }}
                          title="Voir / Modifier"
                          aria-label="Voir / Modifier"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setConfirmDomain(t.domain); setIsConfirmOpen(true) }}
                          title="Supprimer"
                          aria-label="Supprimer"
                          className="inline-flex items-center justify-center w-8 h-8 ml-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                          disabled={!userId}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      

   


      


    

      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={(function() {
          const isCreate = modalMode === 'create'
          if (modalDomain === 'solde') return isCreate ? 'Ajouter le seuil global (solde)' : 'Modifier le seuil global (solde)'
          if (modalDomain === 'comptes') return isCreate ? 'Ajouter le seuil global des comptes' : 'Modifier le seuil global des comptes'
          if (modalDomain === 'depenses') return isCreate ? 'Ajouter le seuil global des dépenses' : 'Modifier le seuil global des dépenses'
          if (modalDomain === 'budget') return isCreate ? 'Ajouter le seuil global du budget' : 'Modifier le seuil global du budget'
          if (modalDomain === 'objectifs') return isCreate ? 'Ajouter le seuil global des objectifs' : 'Modifier le seuil global des objectifs'
          return isCreate ? 'Ajouter un seuil' : 'Modifier le seuil'
        })()}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
            <select
              value={modalDomain || ''}
              onChange={(e) => setModalDomain(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="solde">Solde</option>
              <option value="comptes">Comptes</option>
              <option value="depenses">Dépenses</option>
              <option value="budget">Budget</option>
              <option value="objectifs">Objectifs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau seuil (€)</label>
            <input
              type="number"
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              min={0}
              step={0.01}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            {(!(Number.isFinite(Number(modalValue))) || Number(modalValue) <= 0) && (
              <p className="mt-1 text-xs text-red-600">Veuillez saisir une valeur supérieure à 0.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Information (facultatif)</label>
            <textarea
              value={modalInfo}
              onChange={(e) => setModalInfo(e.target.value)}
              placeholder="Ex: Rappel mensuel, dépassement critique, etc."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              onClick={saveModalValue}
              disabled={isSaving || !modalDomain || !(Number.isFinite(Number(modalValue))) || Number(modalValue) <= 0}
              className={`px-6 py-2 rounded-lg text-white ${isSaving || !modalDomain || !(Number.isFinite(Number(modalValue))) || Number(modalValue) <= 0 ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isSaving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Confirmer la suppression"
        message={`Voulez-vous vraiment supprimer le seuil pour « ${confirmDomain || ''} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger
        loading={isDeleting}
        onCancel={() => { if (!isDeleting) { setIsConfirmOpen(false); setConfirmDomain(null) } }}
        onConfirm={async () => {
          if (!userId || !confirmDomain) return
          setIsDeleting(true)
          try {
            await alertThresholdsService.remove(userId, confirmDomain)
            showSuccess('Seuil supprimé')
            await loadThresholds(userId)
          } catch (e) {
            showError(e?.message || 'Erreur lors de la suppression')
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


