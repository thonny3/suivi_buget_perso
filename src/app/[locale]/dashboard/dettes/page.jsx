"use client"
import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Wallet, Calendar, Save, X, DollarSign, ArrowUpRight, ArrowDownLeft, MoreVertical, Eye, Inbox } from 'lucide-react'
import dettesService from '@/services/dettesService'
import useToast from '@/hooks/useToast'
import depensesService from '@/services/depensesService'
import { useLanguage } from '@/context/LanguageContext'
import { useParams } from 'next/navigation'

const Modal = ({ isOpen, onClose, title, children, size = 'md', fullScreen = false }) => {
  if (!isOpen) return null
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={
        fullScreen
          ? 'bg-white dark:bg-gray-800 w-screen h-screen rounded-none shadow-none overflow-y-auto custom-scrollbar scroll-smooth'
          : `bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar scroll-smooth`
      }>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500 dark:text-gray-300" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const DetteForm = ({ isOpen, onClose, onSave, item = null }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nom: item?.nom || '',
    montant_initial: item?.montant_initial || '',
    montant_restant: item?.montant_restant ?? item?.montant_initial ?? '',
    taux_interet: item?.taux_interet ?? 0,
    date_debut: item?.date_debut ? new Date(item.date_debut).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
    date_fin_prevue: item?.date_fin_prevue ? new Date(item.date_fin_prevue).toISOString().slice(0,10) : '',
    paiement_mensuel: item?.paiement_mensuel ?? 0,
    creancier: item?.creancier || '',
    sens: item?.sens || 'moi',
    statut: item?.statut || 'en cours',
    type: item?.type || 'personne',
    id_compte: item?.id_compte || ''
  })
  const [errors, setErrors] = useState({})
  const [comptes, setComptes] = useState([])
  const [loadAccError, setLoadAccError] = useState('')

  useEffect(() => {
    setFormData({
      nom: item?.nom || '',
      montant_initial: item?.montant_initial || '',
      montant_restant: item?.montant_restant ?? item?.montant_initial ?? '',
      taux_interet: item?.taux_interet ?? 0,
      date_debut: item?.date_debut ? new Date(item.date_debut).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
      date_fin_prevue: item?.date_fin_prevue ? new Date(item.date_fin_prevue).toISOString().slice(0,10) : '',
      paiement_mensuel: item?.paiement_mensuel ?? 0,
      creancier: item?.creancier || '',
      sens: item?.sens || 'moi',
      statut: item?.statut || 'en cours',
      type: item?.type || 'personne',
      id_compte: item?.id_compte || ''
    })
  }, [item])

  // Reset du formulaire à l'ouverture en mode "Nouvelle dette"
  useEffect(() => {
    if (isOpen && !item) {
      setFormData({
        nom: '',
        montant_initial: '',
        montant_restant: '',
        taux_interet: 0,
        date_debut: new Date().toISOString().slice(0,10),
        date_fin_prevue: '',
        paiement_mensuel: 0,
        creancier: '',
        sens: 'moi',
        statut: 'en cours',
        type: 'personne',
        id_compte: ''
      })
    }
  }, [isOpen, item])

  // Charger la liste des comptes pour sélectionner le compte associé
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadAccError('')
        const accs = await depensesService.getMyComptes()
        setComptes(Array.isArray(accs) ? accs : [])
      } catch (e) {
        setLoadAccError(e?.message || 'Erreur chargement des comptes')
      }
    }
    if (isOpen) loadAccounts()
  }, [isOpen])

  const validate = () => {
    const e = {}
    if (!formData.nom.trim()) e.nom = t('dettes.errors.nameRequired')
    if (!formData.montant_initial || Number(formData.montant_initial) <= 0) e.montant_initial = t('dettes.errors.amountRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      nom: formData.nom,
      montant_initial: Number(formData.montant_initial),
      taux_interet: Number(formData.taux_interet || 0),
      date_debut: formData.date_debut,
      date_fin_prevue: formData.date_fin_prevue || null,
      paiement_mensuel: Number(formData.paiement_mensuel || 0),
      creancier: formData.creancier,
      sens: formData.sens,
      statut: formData.statut,
      type: formData.type,
      id_compte: formData.id_compte ? Number(formData.id_compte) : null
    })
    onClose()
  }

  const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? t('dettes.editDebt') : t('dettes.newDebt')} size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.name')}</label>
          <input type="text" value={formData.nom} onChange={(e)=>setFormData(v=>({ ...v, nom: e.target.value }))} className={inputClass(!!errors.nom)} placeholder={t('dettes.namePlaceholder')} />
          {errors.nom && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.nom}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.amount')}</label>
            <input type="number" step="0.01" value={formData.montant_initial} onChange={(e)=>setFormData(v=>({ ...v, montant_initial: e.target.value }))} className={inputClass(!!errors.montant_initial)} placeholder="0.00" />
            {errors.montant_initial && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.montant_initial}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.loanDirection')}</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input type="radio" name="sens" value="moi" checked={formData.sens === 'moi'} onChange={(e)=>setFormData(v=>({ ...v, sens: e.target.value }))} />
                <span>{t('dettes.iLent')}</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input type="radio" name="sens" value="autre" checked={formData.sens === 'autre'} onChange={(e)=>setFormData(v=>({ ...v, sens: e.target.value }))} />
                <span>{t('dettes.iBorrowed')}</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {formData.sens === 'moi' ? t('dettes.iLentDescription') : t('dettes.iBorrowedDescription')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.interestRate')}</label>
            <input type="number" step="0.01" value={formData.taux_interet} onChange={(e)=>setFormData(v=>({ ...v, taux_interet: e.target.value }))} className={inputClass(false)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.monthlyPayment')}</label>
            <input type="number" step="0.01" value={formData.paiement_mensuel} onChange={(e)=>setFormData(v=>({ ...v, paiement_mensuel: e.target.value }))} className={inputClass(false)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.startDate')}</label>
            <input type="date" value={formData.date_debut} onChange={(e)=>setFormData(v=>({ ...v, date_debut: e.target.value }))} className={inputClass(false)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.expectedEndDate')}</label>
            <input type="date" value={formData.date_fin_prevue} onChange={(e)=>setFormData(v=>({ ...v, date_fin_prevue: e.target.value }))} className={inputClass(false)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.creditor')}</label>
            <input type="text" value={formData.creancier} onChange={(e)=>setFormData(v=>({ ...v, creancier: e.target.value }))} className={inputClass(false)} placeholder={t('dettes.creditorPlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.type')}</label>
            <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
              <option value="personne">{t('dettes.typePerson')}</option>
              <option value="banque">{t('dettes.typeBank')}</option>
              <option value="autre">{t('dettes.typeOther')}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.associatedAccount')}</label>
          {loadAccError && <div className="mb-2 text-xs text-red-600 dark:text-red-400">{loadAccError}</div>}
          <select
            value={formData.id_compte}
            onChange={(e)=>setFormData(v=>({ ...v, id_compte: e.target.value }))}
            className={inputClass(false)}
          >
            <option value="">{t('dettes.selectAccount')}</option>
            {comptes.map((c) => (
              <option key={(c.id_compte ?? c.id)} value={(c.id_compte ?? c.id)}>
                {c.nom} ({c.type})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {formData.sens === 'moi' ? t('dettes.accountOutflow') : t('dettes.accountInflow')}
          </p>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{t('common.cancel')}</button>
          <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>{item ? t('dettes.update') : t('dettes.add')}</span></button>
        </div>
      </div>
    </Modal>
  )
}

const PaiementForm = ({ isOpen, onClose, onSave, dette, currency = 'MGA' }) => {
  const { t } = useLanguage()
  const { showError } = useToast()
  const [formData, setFormData] = useState({ montant: '', date_paiement: new Date().toISOString().slice(0,10), id_compte: '' })
  const [comptes, setComptes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const accs = await depensesService.getMyComptes()
        setComptes(Array.isArray(accs) ? accs : [])
      } catch (e) {
        setError(e.message || 'Erreur chargement comptes')
      }
    }
    if (isOpen) load()
  }, [isOpen])

  const montantInitial = Number(dette?.montant_initial || 0)
  const montantRestant = Number(dette?.montant_restant || 0)
  const formatLocal = (amount) => `${Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(amount || 0))} ${currency === 'MGA' ? 'Ar' : (currency || '')}`

  const computeRemainingWithInterestLocal = () => {
    const base = montantRestant
    const rate = Number(dette?.taux_interet || 0) / 100
    if (!(rate > 0)) return base
    return base * (1 + rate)
  }

  const submit = () => {
    if (!formData.montant || Number(formData.montant) <= 0) { setError(t('dettes.errors.invalidAmount')); return }
    if (!formData.date_paiement) { setError(t('dettes.errors.dateRequired')); return }
    if (!formData.id_compte) { setError(t('dettes.errors.accountRequired')); return }
    if (Number(formData.montant) > montantRestant) {
      showError(t('dettes.errors.amountExceedsRemaining'))
      return
    }
    onSave({
      montant: Number(formData.montant),
      date_paiement: formData.date_paiement,
      id_compte: Number(formData.id_compte)
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('dettes.addPayment')} — ${dette?.nom || ''}`} size="md">
      {error && <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded">{error}</div>}
      <div className="space-y-4">
        {dette?.sens && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {dette.sens === 'moi' ? t('dettes.paymentOutflow') : t('dettes.paymentInflow')}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
            <div className="text-gray-600 dark:text-gray-400">{t('dettes.debtAmount')}</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatLocal(montantInitial)}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
            <div className="text-gray-600 dark:text-gray-400">{t('dettes.remainingAmount')}</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatLocal(montantRestant)}</div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.amount')}</label>
          <input type="number" step="0.01" value={formData.montant} onChange={(e)=>setFormData(v=>({ ...v, montant: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.paymentDate')}</label>
          <input type="date" value={formData.date_paiement} onChange={(e)=>setFormData(v=>({ ...v, date_paiement: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.account')}</label>
          <select value={formData.id_compte} onChange={(e)=>setFormData(v=>({ ...v, id_compte: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-white">
            <option value="">{t('dettes.selectAccount')}</option>
            {comptes.map((c) => (
              <option key={(c.id_compte ?? c.id)} value={(c.id_compte ?? c.id)}>{c.nom} ({c.type})</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{t('common.cancel')}</button>
          <button type="button" onClick={submit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>{t('dettes.addPayment')}</span></button>
        </div>
      </div>
    </Modal>
  )
}

export default function DettesPage() {
  const { t } = useLanguage()
  const params = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState(null)
  const [currency, setCurrency] = useState('MGA')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [menuRow, setMenuRow] = useState(null)
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 })
  const menuRef = React.useRef(null)
  const { showSuccess, showError } = useToast()
  const [comptes, setComptes] = useState([])

  // Filtres
  const [statusFilter, setStatusFilter] = useState('') // '', 'en cours', 'en retard', 'terminé'
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const load = async () => {
    try {
      setError('')
      setLoading(true)
      const res = await dettesService.getDettes()
      setItems(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e.message || t('dettes.errors.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  // Réinitialiser/clamp la page quand la liste change
  useEffect(() => {
    const total = Math.max(1, Math.ceil(items.length / itemsPerPage))
    if (currentPage > total) setCurrentPage(total)
    if (currentPage < 1) setCurrentPage(1)
  }, [items.length, itemsPerPage])

  // Fermer le menu si clic à l'extérieur
  useEffect(() => {
    const onDocClick = (e) => {
      if (!openMenuId) return
      const target = e.target
      const isTrigger = target?.closest?.('.action-trigger')
      const isInsideMenu = menuRef.current && menuRef.current.contains(target)
      if (!isTrigger && !isInsideMenu) {
        setOpenMenuId(null)
        setMenuRow(null)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [openMenuId])

  // Charger id_user depuis localStorage ou API
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const u = JSON.parse(stored)
        if (u?.id_user) setUserId(u.id_user)
      }
    } catch (_) {}
    if (!userId) {
      (async () => {
        try {
          const resp = await (await import('@/services/apiService')).default.getCurrentUser()
          if (resp?.user?.id_user) setUserId(resp.user.id_user)
          if (resp?.user?.devise) setCurrency(resp.user.devise)
        } catch (_) {}
      })()
    }
  }, [])

  // Charger les comptes pour afficher le nom du compte associé
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await depensesService.getMyComptes()
        setComptes(Array.isArray(accs) ? accs : [])
      } catch (_) {}
    }
    loadAccounts()
  }, [])

  const getCompteLabel = (id_compte) => {
    if (!id_compte) return ''
    const c = comptes.find((x) => String(x.id_compte ?? x.id) === String(id_compte))
    return c ? `${c.nom} (${c.type})` : ''
  }

  const handleSave = async (payload) => {
    try {
      setError('')
      // Déduire automatiquement le statut selon règles métier
      const remaining = Number(payload?.montant_restant ?? payload?.montant_initial ?? 0)
      const initial = Number(payload?.montant_initial ?? 0)
      const deadline = payload?.date_fin_prevue ? new Date(payload.date_fin_prevue) : null
      const today = new Date()
      let derived = 'en cours'
      if (!Number.isNaN(remaining) && remaining <= 0) {
        derived = 'terminé'
      } else if (deadline && !isNaN(deadline) && deadline < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        derived = 'en retard'
      }
      const withStatus = { ...payload, statut: derived }
      if (editing) {
        await dettesService.updateDette(editing.id_dette, withStatus)
        showSuccess(t('dettes.success.update'))
      } else {
        await dettesService.createDette(withStatus)
        showSuccess(t('dettes.success.create'))
      }
      await load()
    } catch (e) {
      setError(e.message || t('dettes.errors.saveError'))
      showError(e.message || t('dettes.errors.saveError'))
    } finally {
      setEditing(null)
    }
  }

  const handleDelete = async (dette) => {
    try {
      setError('')
      await dettesService.deleteDette(dette.id_dette)
      showSuccess(t('dettes.success.delete'))
      await load()
    } catch (e) {
      setError(e.message || t('dettes.errors.deleteError'))
      showError(e.message || t('dettes.errors.deleteError'))
    }
  }

  const savePayment = async (payment) => {
    if (!target) return
    try {
      setError('')
      const payload = {
        ...payment,
        id_user: userId,
        id_dette: target.id_dette
      }
      await dettesService.addRemboursement(target.id_dette, payload)
      showSuccess(t('dettes.success.paymentAdded'))
      await load()
    } catch (e) {
      setError(e.message || t('dettes.errors.paymentError'))
      showError(e.message || t('dettes.errors.paymentError'))
    } finally {
      setTarget(null)
    }
  }

  const totalRestant = items.reduce((s, d) => s + Number(d.montant_restant || 0), 0)
  const totalInitial = items.reduce((s, d) => s + Number(d.montant_initial || 0), 0)
  const countTotal = items.length

  const displayUnit = (cur) => (cur === 'MGA' ? 'Ar' : cur || '')
  const formatMoney = (amount) => `${Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(amount || 0))} ${displayUnit(currency)}`

  // Statut dérivé pour affichage
  const deriveStatus = (d) => {
    const remaining = Number(d?.montant_restant ?? 0)
    const initial = Number(d?.montant_initial ?? 0)
    const deadline = d?.date_fin_prevue ? new Date(d.date_fin_prevue) : null
    const today = new Date()
    if (!Number.isNaN(remaining) && remaining <= 0) return 'terminé'
    if (deadline && !isNaN(deadline) && deadline < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      return 'en retard'
    }
    return 'en cours'
  }

  const computeRemainingWithInterest = (d) => {
    const base = Number(d?.montant_restant ?? 0)
    const rate = Number(d?.taux_interet ?? 0) / 100
    if (!(rate > 0)) return base
    // intérêt simple unique: base * (1 + rate)
    const accrued = base * (1 + rate)
    return Math.max(0, accrued)
  }

  // Appliquer filtres
  const filteredItems = items.filter((d) => {
    const statusOk = !statusFilter || deriveStatus(d) === statusFilter
    const date = d?.date_debut ? new Date(d.date_debut) : null
    let dateOk = true
    if (dateFrom) {
      const from = new Date(dateFrom)
      dateOk = dateOk && date && date >= from
    }
    if (dateTo) {
      const to = new Date(dateTo)
      // inclure la dateTo entière
      const endDay = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
      dateOk = dateOk && date && date <= endDay
    }
    return statusOk && dateOk
  })

  const countEnRetard = filteredItems.reduce((c, d) => c + (deriveStatus(d) === 'en retard' ? 1 : 0), 0)
  const countEnCours = filteredItems.reduce((c, d) => c + (deriveStatus(d) === 'en cours' ? 1 : 0), 0)
  const countTermine = filteredItems.reduce((c, d) => c + (deriveStatus(d) === 'terminé' ? 1 : 0), 0)

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))
  const goTo = (n) => setCurrentPage(n)

  const renderStatusBadge = (status) => {
    const map = {
      'terminé': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', label: t('dettes.status.completed') },
      'en retard': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', label: t('dettes.status.overdue') },
      'en cours': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', label: t('dettes.status.inProgress') }
    }
    const s = map[status] || map['en cours']
    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-center whitespace-normal break-words ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    )
  }

  const DetailsModal = ({ isOpen, onClose, dette }) => {
    const { t: tDetails } = useLanguage()
    const [payments, setPayments] = useState([])
    const [loadingPayments, setLoadingPayments] = useState(false)
    const [err, setErr] = useState('')

    useEffect(() => {
      const load = async () => {
        if (!dette?.id_dette) return
        try {
          setErr('')
          setLoadingPayments(true)
          const res = await dettesService.listRemboursements(dette.id_dette)
          setPayments(Array.isArray(res) ? res : [])
        } catch (e) {
          setErr(e.message || tDetails('dettes.errors.loadPaymentsError'))
        } finally {
          setLoadingPayments(false)
        }
      }
      if (isOpen) load()
    }, [isOpen, dette?.id_dette])

    const paymentsSorted = [...payments].sort((a, b) => {
      const da = a?.date_paiement ? new Date(a.date_paiement) : new Date(0)
      const db = b?.date_paiement ? new Date(b.date_paiement) : new Date(0)
      return db - da
    })
    const totalPaid = payments.reduce((s, p) => s + Number(p.montant || 0), 0)
    const remainingToReach = Math.max(0, Number(dette?.montant_initial || 0) - Number(dette?.montant_restant || 0))

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`${tDetails('dettes.details')} — ${dette?.nom || ''}`} size="lg">
        {err && <div className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded">{err}</div>}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tDetails('dettes.creditor')}</div>
              <div className="font-medium text-gray-900 dark:text-white">{dette?.creancier || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tDetails('dettes.direction')}</div>
              <div className="font-medium text-gray-900 dark:text-white">{dette?.sens === 'moi' ? tDetails('dettes.iLent') : tDetails('dettes.iBorrowed')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tDetails('dettes.amount')}</div>
              <div className="font-medium text-gray-900 dark:text-white">{formatMoney(dette?.montant_initial)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tDetails('dettes.remaining')}</div>
              <div className="font-medium text-gray-900 dark:text-white">{Number(dette?.taux_interet || 0) > 0 ? (
                <>
                  {formatMoney(computeRemainingWithInterest(dette))}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{tDetails('dettes.includingInterest')}</span>
                </>
              ) : (
                formatMoney(dette?.montant_restant)
              )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tDetails('dettes.startDate')}</div>
              <div className="font-medium text-gray-900 dark:text-white">{dette?.date_debut ? new Date(dette.date_debut).toLocaleDateString('fr-FR') : '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tDetails('dettes.expectedEndDate')}</div>
              <div className="font-medium text-gray-900 dark:text-white">{dette?.date_fin_prevue ? new Date(dette.date_fin_prevue).toLocaleDateString('fr-FR') : '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tDetails('dettes.status.label')}</div>
              <div className="font-medium">{renderStatusBadge(deriveStatus(dette))}</div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{tDetails('dettes.payments')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {tDetails('dettes.totalPaid')}: <span className="font-semibold text-gray-900 dark:text-white">{formatMoney(totalPaid)}</span>
                <span className="mx-2">•</span>
                {tDetails('dettes.remainingToReach')}: <span className="font-semibold text-gray-900 dark:text-white">{formatMoney(remainingToReach)}</span>
                <span className="mx-2">•</span>
                {payments.length} {tDetails('dettes.line')}{payments.length > 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {loadingPayments ? (
                <div className="p-4 text-gray-500 dark:text-gray-400">{tDetails('common.loading')}</div>
              ) : paymentsSorted.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400">{tDetails('dettes.noPayments')}</div>
              ) : (
                <div className="max-h-80 overflow-auto custom-scrollbar scroll-smooth">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-[1]">
                      <tr>
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300">{tDetails('dettes.date')}</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-300">{tDetails('dettes.amount')}</th>
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300">{tDetails('dettes.movement')}</th>
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-300">{tDetails('dettes.account')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsSorted.map((p) => {
                        const mouvement = (dette?.sens === 'moi') ? tDetails('dettes.outflow') : tDetails('dettes.inflow')
                        const color = (dette?.sens === 'moi') ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                        return (
                          <tr key={p.id_remboursement} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-2 px-3 text-gray-900 dark:text-white">{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString('fr-FR') : '-'}</td>
                            <td className={`py-2 px-3 text-right font-medium ${color}`}>{formatMoney(p.montant)}</td>
                            <td className="py-2 px-3 text-gray-900 dark:text-white">{mouvement}</td>
                            <td className="py-2 px-3 text-gray-900 dark:text-white">{p.id_compte ? (getCompteLabel(p.id_compte) || `#${p.id_compte}`) : '-'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                      <tr>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{tDetails('dettes.total')}</td>
                        <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white">{formatMoney(totalPaid)}</td>
                        <td className="py-2 px-3"></td>
                        <td className="py-2 px-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{tDetails('common.close')}</button>
          </div>
        </div>
      </Modal>
    )
  }

  const ConfirmDeleteModal = ({ isOpen, onClose, dette }) => {
    const { t: tDelete } = useLanguage()
    if (!isOpen) return null
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={tDelete('dettes.confirmDelete')} size="sm">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm">{tDelete('dettes.deleteMessage').replace('{name}', dette?.nom || '')}</p>
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{tDelete('dettes.amount')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatMoney(dette?.montant_initial)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-600 dark:text-gray-400">{tDelete('dettes.remaining')}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatMoney(dette?.montant_restant)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{tDelete('common.cancel')}</button>
            <button onClick={async () => { if (dette) { await handleDelete(dette) }; onClose(); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">{tDelete('dettes.delete')}</button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {error && <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('dettes.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{t('dettes.subtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button onClick={() => setFiltersOpen((v)=>!v)} className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base">
              {filtersOpen ? t('dettes.hideFilters') : t('dettes.showFilters')}
            </button>
            <button onClick={() => { setEditing(null); setIsFormOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /><span>{t('dettes.newDebt')}</span>
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mt-4">
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.status.label')}</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: '', label: t('dettes.all') },
                    { key: 'en cours', label: t('dettes.status.inProgress') },
                    { key: 'en retard', label: t('dettes.status.overdue') },
                    { key: 'terminé', label: t('dettes.status.completed') }
                  ].map(s => (
                    <button
                      key={s.key || 'all'}
                      onClick={() => { setStatusFilter(s.key); setCurrentPage(1) }}
                      className={`${(statusFilter === s.key) ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} px-3 py-1.5 rounded-full text-sm`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('dettes.period')}</div>
                  <div className="flex items-center gap-2">
                    <input type="date" value={dateFrom} onChange={(e)=>{ setDateFrom(e.target.value); setCurrentPage(1) }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white w-full" />
                    <span className="text-gray-500 dark:text-gray-400">→</span>
                    <input type="date" value={dateTo} onChange={(e)=>{ setDateTo(e.target.value); setCurrentPage(1) }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white w-full" />
                  </div>
                </div>
                <div className="md:col-span-2 flex items-end gap-2">
                  <button onClick={()=>{ setCurrentPage(1) }} className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-black/90 dark:hover:bg-gray-600">{t('dettes.apply')}</button>
                  {(statusFilter || dateFrom || dateTo) && (
                    <button onClick={()=>{ setStatusFilter(''); setDateFrom(''); setDateTo(''); setCurrentPage(1) }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('dettes.reset')}</button>
                  )}
                </div>
              </div>
              {(statusFilter || dateFrom || dateTo) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-1">{t('dettes.activeFilters')}:</span>
                  {statusFilter && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-full text-sm">
                      {t('dettes.status.label')}: {statusFilter}
                      <button onClick={()=>{ setStatusFilter(''); setCurrentPage(1) }} className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900">×</button>
                    </span>
                  )}
                  {dateFrom && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full text-sm">
                      {t('dettes.from')}: {dateFrom}
                      <button onClick={()=>{ setDateFrom(''); setCurrentPage(1) }} className="text-gray-700 dark:text-gray-300 hover:text-gray-900">×</button>
                    </span>
                  )}
                  {dateTo && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full text-sm">
                      {t('dettes.to')}: {dateTo}
                      <button onClick={()=>{ setDateTo(''); setCurrentPage(1) }} className="text-gray-700 dark:text-gray-300 hover:text-gray-900">×</button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 sm:gap-6">
          <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dettes.totalInitialAmount')}</h3>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-gray-900 dark:text-white flex items-center gap-2 break-words break-all"><DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" /><span className="leading-tight">{formatMoney(totalInitial)}</span></p>
          </div>
          <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dettes.totalRemainingAmount')}</h3>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-gray-900 dark:text-white flex items-center gap-2 break-words break-all"><DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" /><span className="leading-tight">{formatMoney(totalRestant)}</span></p>
          </div>
          <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dettes.debtCount')}</h3>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-gray-900 dark:text-white break-words break-all leading-tight">{countTotal}</p>
          </div>
          <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dettes.status.overdue')}</h3>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-red-700 dark:text-red-400 break-words break-all leading-tight">{countEnRetard}</p>
          </div>
          <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dettes.status.inProgress')}</h3>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-blue-700 dark:text-blue-400 break-words break-all leading-tight">{countEnCours}</p>
          </div>
          <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{t('dettes.status.completed')}</h3>
            <p className="text-xl sm:text-2xl font-bold mt-2 text-green-700 dark:text-green-400 break-words break-all leading-tight">{countTermine}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar scroll-smooth">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.name')}</th>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.creditor')}</th>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.direction')}</th>
                  <th className="text-right py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.amount')}</th>
                  <th className="text-right py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.rate')}</th>
                  <th className="text-right py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.remaining')}</th>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.startDate')}</th>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.expectedEndDate')}</th>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.status.label')}</th>
                  <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('dettes.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="py-10 text-center text-gray-500 dark:text-gray-400">{t('common.loading')}</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        <div className="text-sm">{t('dettes.emptyTable')}</div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedItems.map((d) => (
                  <tr key={d.id_dette} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"><Wallet className="w-4 h-4" /></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{d.nom}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{getCompteLabel(d.id_compte) || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{d.creancier || '-'}</td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {d.sens === 'moi' ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">{t('dettes.outflow')}</span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">{t('dettes.inflow')}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-900 dark:text-white">
                      <span className="inline-flex items-center gap-1">{formatMoney(d.montant_initial)}</span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-700 dark:text-gray-300">
                      {Number(d.taux_interet || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}%
                    </td>
                    <td className="py-4 px-6 text-right text-gray-900 dark:text-white">
                      <span className="inline-flex items-center gap-1">{formatMoney(d.montant_restant)}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {d.date_debut ? new Date(d.date_debut).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                      {d.date_fin_prevue ? new Date(d.date_fin_prevue).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="py-4 px-6">
                      {renderStatusBadge(deriveStatus(d))}
                    </td>
                    <td className="py-4 px-6 relative">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            const r = e.currentTarget.getBoundingClientRect()
                            setMenuCoords({ top: r.bottom + window.scrollY, left: r.right + window.scrollX - 192 })
                            setMenuRow(d)
                            setOpenMenuId(openMenuId === d.id_dette ? null : d.id_dette)
                          }}
                          className="action-trigger p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={t('dettes.actions')}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot></tfoot>
            </table>
          </div>
        </div>

        {openMenuId && menuRow && (
          <div ref={menuRef} className="fixed z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg" style={{ top: menuCoords.top, left: menuCoords.left }}>
            <ul className="py-1 text-sm text-gray-700 dark:text-gray-300">
              {deriveStatus(menuRow) !== 'terminé' && (
                <li>
                  <button onClick={() => { setTarget(menuRow); setIsPaymentOpen(true); setOpenMenuId(null); setMenuRow(null) }} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" /> {t('dettes.addPayment')}
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => { setTarget(menuRow); setIsDetailsOpen(true); setOpenMenuId(null); setMenuRow(null) }} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" /> {t('dettes.viewDetails')}
                </button>
              </li>
              <li>
                <button onClick={() => { setEditing(menuRow); setIsFormOpen(true); setOpenMenuId(null); setMenuRow(null) }} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-emerald-600" /> {t('dettes.edit')}
                </button>
              </li>
              <li>
                <button onClick={() => { setDeleteTarget(menuRow); setIsDeleteOpen(true); setOpenMenuId(null); setMenuRow(null) }} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-600" /> {t('dettes.delete')}
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredItems.length === 0 ? `0 ${t('dettes.result')}` : (
                <>{t('dettes.displaying')} {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} {t('dettes.of')} {filteredItems.length}</>
              )}
            </div>
            <div className="inline-flex items-center gap-2">
              <button
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={goPrev}
                disabled={currentPage <= 1}
              >
                {t('dettes.previous')}
              </button>
              {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`px-3 py-2 rounded-lg border ${currentPage === p ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {p}
                  </button>
                )
              })}
              {totalPages > 5 && (
                <span className="px-2 text-gray-500 dark:text-gray-400">…</span>
              )}
              <button
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={goNext}
                disabled={currentPage >= totalPages}
              >
                {t('dettes.next')}
              </button>
            </div>
          </div>
        )}

        <DetteForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditing(null) }} onSave={handleSave} item={editing} />
        <PaiementForm isOpen={isPaymentOpen} onClose={() => { setIsPaymentOpen(false); setTarget(null) }} onSave={savePayment} dette={target} currency={currency} />
        <DetailsModal isOpen={isDetailsOpen} onClose={() => { setIsDetailsOpen(false); setTarget(null) }} dette={target} />
        <ConfirmDeleteModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setDeleteTarget(null) }} dette={deleteTarget} />
      </div>
    </div>
  )
}


