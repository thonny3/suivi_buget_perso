"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Save, X, TrendingUp, Edit2, Trash2, DollarSign, CreditCard } from 'lucide-react'
import accountsService from '@/services/accountsService'
import investissementsService from '@/services/investissementsService'
import { useLanguage } from '@/context/LanguageContext'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar scroll-smooth`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const InvestmentForm = ({ isOpen, onClose, onSave, item = null }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nom: '',
    type: 'action',
    montant_investi: '',
    date_achat: new Date().toISOString().slice(0,10),
    valeur_actuelle: '',
    projet: '',
    duree_mois: '',
    taux_prevu: ''
  })
  const [errors, setErrors] = useState({})

  React.useEffect(() => {
    if (item) {
      setFormData({
        nom: item.nom || '',
        type: item.type || 'action',
        montant_investi: item.montant_investi ?? '',
        date_achat: item.date_achat ? new Date(item.date_achat).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
        valeur_actuelle: item.valeur_actuelle ?? '',
        projet: item.projet || '',
        duree_mois: item.duree_mois ?? '',
        taux_prevu: item.taux_prevu ?? ''
      })
    } else {
      setFormData({
        nom: '',
        type: 'action',
        montant_investi: '',
        date_achat: new Date().toISOString().slice(0,10),
        valeur_actuelle: '',
        projet: '',
        duree_mois: '',
        taux_prevu: ''
      })
    }
    setErrors({})
  }, [item])

  const validate = () => {
    const e = {}
    if (!formData.nom.trim()) e.nom = t('investissement.errors.nameRequired')
    if (!formData.montant_investi || Number(formData.montant_investi) <= 0) e.montant_investi = t('investissement.errors.amountRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) return
    onSave({
      nom: formData.nom,
      type: formData.type,
      montant_investi: Number(formData.montant_investi),
      date_achat: formData.date_achat,
      valeur_actuelle: formData.valeur_actuelle === '' ? undefined : Number(formData.valeur_actuelle),
      projet: formData.projet,
      duree_mois: formData.duree_mois === '' ? undefined : Number(formData.duree_mois),
      taux_prevu: formData.taux_prevu === '' ? undefined : Number(formData.taux_prevu)
    })
    onClose()
  }

  const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? t('investissement.editInvestment') : t('investissement.addInvestment')} size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.name')}</label>
          <input type="text" value={formData.nom} onChange={(e)=>setFormData(v=>({ ...v, nom: e.target.value }))} className={inputClass(!!errors.nom)} placeholder={t('investissement.namePlaceholder')} />
          {errors.nom && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.nom}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.type')}</label>
            <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
              <option value="action">{t('investissement.typeAction')}</option>
              <option value="fonds">{t('investissement.typeFund')}</option>
              <option value="crypto">{t('investissement.typeCrypto')}</option>
              <option value="immobilier">{t('investissement.typeRealEstate')}</option>
              <option value="autre">{t('investissement.typeOther')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.purchaseDate')}</label>
            <input type="date" value={formData.date_achat} onChange={(e)=>setFormData(v=>({ ...v, date_achat: e.target.value }))} className={inputClass(false)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.project')}</label>
          <input type="text" value={formData.projet} onChange={(e)=>setFormData(v=>({ ...v, projet: e.target.value }))} className={inputClass(false)} placeholder={t('investissement.projectPlaceholder')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.investedAmount')}</label>
            <input type="number" step="0.01" value={formData.montant_investi} onChange={(e)=>setFormData(v=>({ ...v, montant_investi: e.target.value }))} className={inputClass(!!errors.montant_investi)} placeholder="0.00" />
            {errors.montant_investi && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.montant_investi}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.currentValue')}</label>
            <input type="number" step="0.01" value={formData.valeur_actuelle} onChange={(e)=>setFormData(v=>({ ...v, valeur_actuelle: e.target.value }))} className={inputClass(false)} placeholder="0.00" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.duration')}</label>
            <input type="number" step="1" value={formData.duree_mois} onChange={(e)=>setFormData(v=>({ ...v, duree_mois: e.target.value }))} className={inputClass(false)} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.expectedRate')}</label>
            <input type="number" step="0.01" value={formData.taux_prevu} onChange={(e)=>setFormData(v=>({ ...v, taux_prevu: e.target.value }))} className={inputClass(false)} placeholder="0.00" />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{t('common.cancel')}</button>
          <button type="button" onClick={submit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{item ? t('investissement.update') : t('investissement.save')}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function InvestissementDashboardPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [revenueModalFor, setRevenueModalFor] = useState(null)
  const [expenseModalFor, setExpenseModalFor] = useState(null)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [error, setError] = useState('')

  const totalInvesti = items.reduce((s, i) => s + Number(i.montant_investi || 0), 0)
  const totalRevenus = items.reduce((s, i) => s + Number(i.total_revenus || 0), 0)
  const totalDepenses = items.reduce((s, i) => s + Number(i.total_depenses || 0), 0)
  const totalValeur = items.reduce((s, i) => s + Number(i.valeur_actuelle || i.montant_investi || 0), 0)
  const beneficeNet = (totalRevenus - totalDepenses) + (totalValeur - totalInvesti)

  const load = async () => {
    try {
      setError('')
      const list = await investissementsService.list()
      const normalized = Array.isArray(list) ? list.map(it => ({
        ...it,
        id: it.id_investissement || it.id,
        total_revenus: it.total_revenus ?? it.revenus_total ?? 0,
        total_depenses: it.total_depenses ?? it.depenses_total ?? 0
      })) : []
      setItems(normalized)
    } catch (e) {
      setError(e.message || t('investissement.errors.loadError'))
    }
  }

  useEffect(() => { load() }, [t])

  const handleSave = async (payload) => {
    try {
      setError('')
      if (editing) {
        await investissementsService.update(editing.id_investissement || editing.id, payload)
        setEditing(null)
      } else {
        await investissementsService.create(payload)
      }
      await load()
    } catch (e) {
      setError(e.message || t('investissement.errors.saveError'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setError('')
      await investissementsService.remove(deleteTarget.id_investissement || deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (e) {
      setError(e.message || t('investissement.errors.deleteError'))
    }
  }

  const addRevenue = async (investmentId, entry) => {
    try {
      await investissementsService.addRevenu(investmentId, {
        montant: entry.montant,
        date: entry.date,
        type: entry.type,
        note: entry.note,
        id_compte: entry.id_compte
      })
      await load()
    } catch (_e) {}
  }

  const addExpense = async (investmentId, entry) => {
    try {
      await investissementsService.addDepense(investmentId, {
        montant: entry.montant,
        date: entry.date,
        type: entry.type,
        note: entry.note,
        id_compte: entry.id_compte
      })
      await load()
    } catch (_e) {}
  }


  const RevenueForm = ({ isOpen, onClose, onSave, investment }) => {
    const { t } = useLanguage()
    const [formData, setFormData] = useState({ montant: '', date: new Date().toISOString().slice(0,10), type: 'loyer', note: '', id_compte: '' })
    const [errors, setErrors] = useState({})
    const [accounts, setAccounts] = useState([])
    const [accError, setAccError] = useState('')

    React.useEffect(() => {
      const load = async () => {
        try {
          setAccError('')
          const result = await accountsService.getMyAccounts()
          if (result?.success) {
            const formatted = result.data.map(a => accountsService.formatAccount ? accountsService.formatAccount(a) : a)
            setAccounts(Array.isArray(formatted) ? formatted : [])
          } else if (result?.data) {
            setAccounts(Array.isArray(result.data) ? result.data : [])
          } else {
            setAccounts([])
          }
        } catch (e) {
          setAccError(e.message || t('investissement.errors.loadAccountsError'))
          setAccounts([])
        }
      }
      if (isOpen) load()
    }, [isOpen, t])
    const validate = () => {
      const e = {}
      if (!formData.montant || Number(formData.montant) <= 0) e.montant = t('investissement.errors.amountRequired')
      if (!formData.id_compte) e.id_compte = t('investissement.errors.accountRequired')
      setErrors(e)
      return Object.keys(e).length === 0
    }
    const submit = () => {
      if (!validate()) return
      onSave({
        montant: Number(formData.montant),
        date: formData.date,
        type: formData.type,
        note: formData.note,
        id_compte: Number(formData.id_compte)
      })
      onClose()
    }
    const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`${t('investissement.addRevenue')} — ${investment?.nom || ''}`} size="md">
        <div className="space-y-4">
          {accError && <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 rounded">{accError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.amount')}</label>
            <input type="number" step="0.01" value={formData.montant} onChange={(e)=>setFormData(v=>({ ...v, montant: e.target.value }))} className={inputClass(!!errors.montant)} placeholder="0.00" />
            {errors.montant && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.montant}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.date')}</label>
              <input type="date" value={formData.date} onChange={(e)=>setFormData(v=>({ ...v, date: e.target.value }))} className={inputClass(false)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.type')}</label>
              <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
                <option value="loyer">{t('investissement.revenueTypeRent')}</option>
                <option value="revente">{t('investissement.revenueTypeResale')}</option>
                <option value="benefice">{t('investissement.revenueTypeProfit')}</option>
                <option value="autre">{t('investissement.typeOther')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.creditedAccount')}</label>
            <select value={formData.id_compte} onChange={(e)=>setFormData(v=>({ ...v, id_compte: e.target.value }))} className={inputClass(!!errors.id_compte)}>
              <option value="">{t('investissement.selectAccount')}</option>
              {accounts.map((c) => (
                <option key={(c.id_compte ?? c.id)} value={(c.id_compte ?? c.id)}>{c.nom} — {c.typeFormatted || c.type}</option>
              ))}
            </select>
            {errors.id_compte && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.id_compte}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.note')}</label>
            <input type="text" value={formData.note} onChange={(e)=>setFormData(v=>({ ...v, note: e.target.value }))} className={inputClass(false)} placeholder={t('investissement.notePlaceholder')} />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{t('common.cancel')}</button>
            <button type="button" onClick={submit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>{t('investissement.save')}</span></button>
          </div>
        </div>
      </Modal>
    )
  }

  const ExpenseForm = ({ isOpen, onClose, onSave, investment }) => {
    const { t } = useLanguage()
    const [formData, setFormData] = useState({ montant: '', date: new Date().toISOString().slice(0,10), type: 'charge', note: '', id_compte: '' })
    const [errors, setErrors] = useState({})
    const [accounts, setAccounts] = useState([])
    const [accError, setAccError] = useState('')

    React.useEffect(() => {
      const load = async () => {
        try {
          setAccError('')
          const result = await accountsService.getMyAccounts()
          if (result?.success) {
            const formatted = result.data.map(a => accountsService.formatAccount ? accountsService.formatAccount(a) : a)
            setAccounts(Array.isArray(formatted) ? formatted : [])
          } else if (result?.data) {
            setAccounts(Array.isArray(result.data) ? result.data : [])
          } else {
            setAccounts([])
          }
        } catch (e) {
          setAccError(e.message || t('investissement.errors.loadAccountsError'))
          setAccounts([])
        }
      }
      if (isOpen) load()
    }, [isOpen, t])
    const validate = () => {
      const e = {}
      if (!formData.montant || Number(formData.montant) <= 0) e.montant = t('investissement.errors.amountRequired')
      if (!formData.id_compte) e.id_compte = t('investissement.errors.accountRequired')
      setErrors(e)
      return Object.keys(e).length === 0
    }
    const submit = () => {
      if (!validate()) return
      onSave({
        montant: Number(formData.montant),
        date: formData.date,
        type: formData.type,
        note: formData.note,
        id_compte: Number(formData.id_compte)
      })
      onClose()
    }
    const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`${t('investissement.addExpense')} — ${investment?.nom || ''}`} size="md">
        <div className="space-y-4">
          {accError && <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 rounded">{accError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.amount')}</label>
            <input type="number" step="0.01" value={formData.montant} onChange={(e)=>setFormData(v=>({ ...v, montant: e.target.value }))} className={inputClass(!!errors.montant)} placeholder="0.00" />
            {errors.montant && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.montant}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.date')}</label>
              <input type="date" value={formData.date} onChange={(e)=>setFormData(v=>({ ...v, date: e.target.value }))} className={inputClass(false)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.type')}</label>
              <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
                <option value="charge">{t('investissement.expenseTypeCharge')}</option>
                <option value="entretien">{t('investissement.expenseTypeMaintenance')}</option>
                <option value="impot">{t('investissement.expenseTypeTax')}</option>
                <option value="autre">{t('investissement.typeOther')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.debitedAccount')}</label>
            <select value={formData.id_compte} onChange={(e)=>setFormData(v=>({ ...v, id_compte: e.target.value }))} className={inputClass(!!errors.id_compte)}>
              <option value="">{t('investissement.selectAccount')}</option>
              {accounts.map((c) => (
                <option key={(c.id_compte ?? c.id)} value={(c.id_compte ?? c.id)}>{c.nom} — {c.typeFormatted || c.type}</option>
              ))}
            </select>
            {errors.id_compte && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.id_compte}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('investissement.note')}</label>
            <input type="text" value={formData.note} onChange={(e)=>setFormData(v=>({ ...v, note: e.target.value }))} className={inputClass(false)} placeholder={t('investissement.notePlaceholder')} />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">{t('common.cancel')}</button>
            <button type="button" onClick={submit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>{t('investissement.save')}</span></button>
          </div>
        </div>
      </Modal>
    )
  }

  const ReportModal = ({ isOpen, onClose, items }) => {
    const { t } = useLanguage()
    const [periode, setPeriode] = useState('mensuel')
    const [annee, setAnnee] = useState(new Date().getFullYear())
    const [mois, setMois] = useState(new Date().getMonth() + 1)
    const [investFilter, setInvestFilter] = useState('all')
    const [includeVariation, setIncludeVariation] = useState(true)
    const [loading, setLoading] = useState(false)
    const [detailsById, setDetailsById] = useState({}) // { [id]: { revenus: [], depenses: [] } }
    const [err, setErr] = useState('')

    // Charger les détails (revenus/dépenses) depuis l'API pour le(s) investissement(s) sélectionné(s)
    useEffect(() => {
      const loadDetails = async () => {
        if (!isOpen) return
        try {
          setErr('')
          setLoading(true)
          const ids = investFilter === 'all' ? (items || []).map(it => it.id_investissement || it.id) : [investFilter]
          const next = { ...detailsById }
          for (const rawId of ids) {
            const id = Number(rawId)
            if (!id || next[id]) continue
            const [rev, dep] = await Promise.all([
              investissementsService.listRevenus(id),
              investissementsService.listDepenses(id)
            ])
            const revenus = Array.isArray(rev) ? rev.map(r => ({ montant: Number(r.montant||0), date: r.date_revenu || r.date, type: r.type, note: r.note })) : []
            const depenses = Array.isArray(dep) ? dep.map(d => ({ montant: Number(d.montant||0), date: d.date_depense || d.date, type: d.type, note: d.note })) : []
            next[id] = { revenus, depenses }
          }
          setDetailsById(next)
        } catch (e) {
          setErr(e.message || t('investissement.errors.loadDetailsError'))
        } finally {
          setLoading(false)
        }
      }
      loadDetails()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, investFilter, items, t])

    const groupKey = (dateStr) => {
      const d = new Date(dateStr)
      if (Number.isNaN(d.getTime())) return 'N/A'
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      return periode === 'mensuel' ? `${y}-${m}` : `${y}`
    }

    const filtered = items
      .filter(it => investFilter === 'all' ? true : String(it.id) === String(investFilter))
      .map(it => ({
        ...it,
        revenus: ((detailsById[it.id_investissement || it.id]?.revenus) || []).filter(r => {
          const d = new Date(r.date)
          return periode === 'mensuel' ? (d.getFullYear() === Number(annee) && d.getMonth() + 1 === Number(mois)) : (d.getFullYear() === Number(annee))
        }),
        depenses: ((detailsById[it.id_investissement || it.id]?.depenses) || []).filter(d => {
          const dd = new Date(d.date)
          return periode === 'mensuel' ? (dd.getFullYear() === Number(annee) && dd.getMonth() + 1 === Number(mois)) : (dd.getFullYear() === Number(annee))
        })
      }))

    const lignes = filtered.map(it => {
      const revenus = it.revenus.reduce((s, r) => s + Number(r.montant || 0), 0)
      const depenses = it.depenses.reduce((s, d) => s + Number(d.montant || 0), 0)
      const variation = Number((it.valeur_actuelle ?? it.montant_investi) || 0) - Number(it.montant_investi || 0)
      const net = revenus - depenses
      const netInclValue = net + variation
      return { id: it.id, nom: it.nom, revenus, depenses, variation, net, netInclValue }
    })

    const totalRevenusR = lignes.reduce((s, l) => s + l.revenus, 0)
    const totalDepensesR = lignes.reduce((s, l) => s + l.depenses, 0)
    const totalVariationR = lignes.reduce((s, l) => s + l.variation, 0)
    const totalNetR = lignes.reduce((s, l) => s + (includeVariation ? l.netInclValue : l.net), 0)

    const exportCSV = () => {
      const headers = includeVariation
        ? ['Investissement','Revenus','Depenses','VariationValeur','NetInclValeur']
        : ['Investissement','Revenus','Depenses','Net']
      const rows = lignes.map(l => includeVariation
        ? [l.nom, l.revenus, l.depenses, l.variation, l.netInclValue]
        : [l.nom, l.revenus, l.depenses, l.net])
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-${periode}-${annee}${periode==='mensuel'?`-${String(mois).padStart(2,'0')}`:''}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const inputClass = `px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={periode==='mensuel' ? t('investissement.monthlyReport') : t('investissement.yearlyReport')} size="xl">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select value={periode} onChange={(e)=>setPeriode(e.target.value)} className={inputClass}>
              <option value="mensuel">{t('investissement.monthly')}</option>
              <option value="annuel">{t('investissement.yearly')}</option>
            </select>
            <input type="number" value={annee} onChange={(e)=>setAnnee(e.target.value)} className={inputClass} />
            {periode === 'mensuel' && (
              <input type="number" min="1" max="12" value={mois} onChange={(e)=>setMois(e.target.value)} className={inputClass} />
            )}
            <select value={investFilter} onChange={(e)=>setInvestFilter(e.target.value)} className={inputClass}>
              <option value="all">{t('investissement.allInvestments')}</option>
              {items.map(it => (
                <option key={it.id} value={it.id}>{it.nom}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={includeVariation} onChange={(e)=>setIncludeVariation(e.target.checked)} />
              {t('investissement.includeValueVariation')}
            </label>
            <button onClick={exportCSV} className="ml-auto px-4 py-2 bg-gray-800 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-lg">{t('investissement.exportCSV')}</button>
          </div>
          {err && <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 rounded">{err}</div>}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto custom-scrollbar scroll-smooth">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-white">{t('investissement.name')}</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-white">{t('investissement.revenues')}</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-white">{t('investissement.expenses')}</th>
                    {includeVariation && <th className="text-right py-3 px-4 text-gray-900 dark:text-white">{t('investissement.valueVariation')}</th>}
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-white">{includeVariation ? t('investissement.netInclValue') : t('investissement.net')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={includeVariation ? 5 : 4} className="py-8 text-center text-gray-500 dark:text-gray-400">{t('common.loading')}</td></tr>
                  ) : lignes.length === 0 ? (
                    <tr><td colSpan={includeVariation ? 5 : 4} className="py-8 text-center text-gray-500 dark:text-gray-400">{t('investissement.noData')}</td></tr>
                  ) : lignes.map((l, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{l.nom}</td>
                      <td className="py-3 px-4 text-right"><span className="text-emerald-600 dark:text-emerald-400 font-medium">{l.revenus.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                      <td className="py-3 px-4 text-right"><span className="text-red-600 dark:text-red-400 font-medium">{l.depenses.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                      {includeVariation && (
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{l.variation.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                      )}
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{(includeVariation ? l.netInclValue : l.net).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <tr>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{t('investissement.totals')}</td>
                    <td className="py-3 px-4 text-right"><span className="text-emerald-700 dark:text-emerald-400">{totalRevenusR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    <td className="py-3 px-4 text-right"><span className="text-red-700 dark:text-red-400">{totalDepensesR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    {includeVariation && (
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{totalVariationR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    )}
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{totalNetR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('investissement.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('investissement.subtitle')}</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button onClick={() => { setEditing(null); setIsFormOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg">
              <Plus className="w-5 h-5" />
              <span>{t('investissement.addInvestment')}</span>
            </button>
            <button onClick={() => setIsReportOpen(true)} className="bg-gray-800 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors shadow">{t('investissement.report')}</button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('investissement.totalInvested')}</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{totalInvesti.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('investissement.revenuesExpenses')}</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{(totalRevenus - totalDepenses).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('investissement.netProfit')}</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{beneficeNet.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.name')}</th>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.type')}</th>
                  <th className="text-right py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.investedAmount')}</th>
                  <th className="text-right py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.revenues')}</th>
                  <th className="text-right py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.expenses')}</th>
                  <th className="text-right py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.currentValue')}</th>
                  <th className="text-left py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.purchaseDate')}</th>
                  <th className="text-center py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{t('investissement.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-gray-500 dark:text-gray-400">{t('investissement.noPositions')}</td></tr>
                ) : items.map((it) => (
                  <tr key={it.id_investissement || it.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"><TrendingUp className="w-4 h-4" /></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{it.nom}</p>
            </div>
          </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300 capitalize">{it.type}</td>
                    <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{Number(it.montant_investi || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className="py-4 px-6 text-right"><span className="text-emerald-600 dark:text-emerald-400 font-medium">{Number(it.total_revenus || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    <td className="py-4 px-6 text-right"><span className="text-red-600 dark:text-red-400 font-medium">{Number(it.total_depenses || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    <td className="py-4 px-6 text-right text-gray-900 dark:text-white">{Number((it.valeur_actuelle ?? it.montant_investi) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className="py-4 px-6 text-gray-700 dark:text-gray-300">{it.date_achat ? new Date(it.date_achat).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setRevenueModalFor(it)} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg transition-colors" title={t('investissement.addRevenue')}>
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExpenseModalFor(it)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors" title={t('investissement.addExpense')}>
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditing(it); setIsFormOpen(true) }} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg transition-colors" title={t('investissement.edit')}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(it)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors" title={t('investissement.delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
            </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <InvestmentForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditing(null) }} onSave={handleSave} item={editing} />
        <RevenueForm
          isOpen={!!revenueModalFor}
          onClose={() => setRevenueModalFor(null)}
          onSave={(entry) => { if (revenueModalFor) addRevenue(revenueModalFor.id, entry) }}
          investment={revenueModalFor}
        />
        <ExpenseForm
          isOpen={!!expenseModalFor}
          onClose={() => setExpenseModalFor(null)}
          onSave={(entry) => { if (expenseModalFor) addExpense(expenseModalFor.id, entry) }}
          investment={expenseModalFor}
        />
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          items={items}
        />
        {/* Delete confirm */}
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title={t('investissement.confirmDelete')} size="sm">
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{t('investissement.deleteMessage').replace('{name}', deleteTarget?.nom || '')} {t('investissement.irreversible')}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200">{t('common.cancel')}</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">{t('investissement.delete')}</button>
          </div>
        </div>
        </Modal>
      </div>
    </div>
  )
}
