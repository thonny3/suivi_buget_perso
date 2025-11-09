"use client"
import React, { useState, useEffect } from 'react'
import { Plus, Save, X, TrendingUp, Edit2, Trash2, DollarSign, CreditCard } from 'lucide-react'
import accountsService from '@/services/accountsService'
import investissementsService from '@/services/investissementsService'

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

const InvestmentForm = ({ isOpen, onClose, onSave, item = null }) => {
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
    if (!formData.nom.trim()) e.nom = 'Nom requis'
    if (!formData.montant_investi || Number(formData.montant_investi) <= 0) e.montant_investi = 'Montant > 0'
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

  const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Modifier un investissement' : 'Ajouter un investissement'} size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input type="text" value={formData.nom} onChange={(e)=>setFormData(v=>({ ...v, nom: e.target.value }))} className={inputClass(!!errors.nom)} placeholder="Ex: AAPL, Fonds X, Immeuble..." />
          {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
              <option value="action">Action</option>
              <option value="fonds">Fonds</option>
              <option value="crypto">Crypto</option>
              <option value="immobilier">Immobilier</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date d'achat</label>
            <input type="date" value={formData.date_achat} onChange={(e)=>setFormData(v=>({ ...v, date_achat: e.target.value }))} className={inputClass(false)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Projet (optionnel)</label>
          <input type="text" value={formData.projet} onChange={(e)=>setFormData(v=>({ ...v, projet: e.target.value }))} className={inputClass(false)} placeholder="Nom du projet immobilier" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant investi</label>
            <input type="number" step="0.01" value={formData.montant_investi} onChange={(e)=>setFormData(v=>({ ...v, montant_investi: e.target.value }))} className={inputClass(!!errors.montant_investi)} placeholder="0.00" />
            {errors.montant_investi && <p className="text-red-500 text-sm mt-1">{errors.montant_investi}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valeur actuelle (optionnel)</label>
            <input type="number" step="0.01" value={formData.valeur_actuelle} onChange={(e)=>setFormData(v=>({ ...v, valeur_actuelle: e.target.value }))} className={inputClass(false)} placeholder="0.00" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durée (mois, optionnel)</label>
            <input type="number" step="1" value={formData.duree_mois} onChange={(e)=>setFormData(v=>({ ...v, duree_mois: e.target.value }))} className={inputClass(false)} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taux de rentabilité prévu % (optionnel)</label>
            <input type="number" step="0.01" value={formData.taux_prevu} onChange={(e)=>setFormData(v=>({ ...v, taux_prevu: e.target.value }))} className={inputClass(false)} placeholder="0.00" />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
          <button type="button" onClick={submit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{item ? 'Mettre à jour' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function InvestissementDashboardPage() {
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
      setError(e.message || 'Erreur chargement investissements')
    }
  }

  useEffect(() => { load() }, [])

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
      setError(e.message || 'Erreur enregistrement')
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
      setError(e.message || 'Erreur suppression')
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
          setAccError(e.message || 'Erreur chargement comptes')
          setAccounts([])
        }
      }
      if (isOpen) load()
    }, [isOpen])
    const validate = () => {
      const e = {}
      if (!formData.montant || Number(formData.montant) <= 0) e.montant = 'Montant > 0'
      if (!formData.id_compte) e.id_compte = 'Compte requis'
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
    const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Ajouter un revenu — ${investment?.nom || ''}`} size="md">
        <div className="space-y-4">
          {accError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{accError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
            <input type="number" step="0.01" value={formData.montant} onChange={(e)=>setFormData(v=>({ ...v, montant: e.target.value }))} className={inputClass(!!errors.montant)} placeholder="0.00" />
            {errors.montant && <p className="text-red-500 text-sm mt-1">{errors.montant}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input type="date" value={formData.date} onChange={(e)=>setFormData(v=>({ ...v, date: e.target.value }))} className={inputClass(false)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
                <option value="loyer">Loyer</option>
                <option value="revente">Revente</option>
                <option value="benefice">Part de bénéfice</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compte crédité</label>
            <select value={formData.id_compte} onChange={(e)=>setFormData(v=>({ ...v, id_compte: e.target.value }))} className={inputClass(!!errors.id_compte)}>
              <option value="">Sélectionner un compte</option>
              {accounts.map((c) => (
                <option key={(c.id_compte ?? c.id)} value={(c.id_compte ?? c.id)}>{c.nom} — {c.typeFormatted || c.type}</option>
              ))}
            </select>
            {errors.id_compte && <p className="text-red-500 text-sm mt-1">{errors.id_compte}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note (optionnel)</label>
            <input type="text" value={formData.note} onChange={(e)=>setFormData(v=>({ ...v, note: e.target.value }))} className={inputClass(false)} placeholder="Description" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
            <button type="button" onClick={submit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>Enregistrer</span></button>
          </div>
        </div>
      </Modal>
    )
  }

  const ExpenseForm = ({ isOpen, onClose, onSave, investment }) => {
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
          setAccError(e.message || 'Erreur chargement comptes')
          setAccounts([])
        }
      }
      if (isOpen) load()
    }, [isOpen])
    const validate = () => {
      const e = {}
      if (!formData.montant || Number(formData.montant) <= 0) e.montant = 'Montant > 0'
      if (!formData.id_compte) e.id_compte = 'Compte requis'
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
    const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Ajouter une dépense — ${investment?.nom || ''}`} size="md">
        <div className="space-y-4">
          {accError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{accError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
            <input type="number" step="0.01" value={formData.montant} onChange={(e)=>setFormData(v=>({ ...v, montant: e.target.value }))} className={inputClass(!!errors.montant)} placeholder="0.00" />
            {errors.montant && <p className="text-red-500 text-sm mt-1">{errors.montant}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input type="date" value={formData.date} onChange={(e)=>setFormData(v=>({ ...v, date: e.target.value }))} className={inputClass(false)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
                <option value="charge">Charge</option>
                <option value="entretien">Entretien</option>
                <option value="impot">Impôt</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compte débité</label>
            <select value={formData.id_compte} onChange={(e)=>setFormData(v=>({ ...v, id_compte: e.target.value }))} className={inputClass(!!errors.id_compte)}>
              <option value="">Sélectionner un compte</option>
              {accounts.map((c) => (
                <option key={(c.id_compte ?? c.id)} value={(c.id_compte ?? c.id)}>{c.nom} — {c.typeFormatted || c.type}</option>
              ))}
            </select>
            {errors.id_compte && <p className="text-red-500 text-sm mt-1">{errors.id_compte}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note (optionnel)</label>
            <input type="text" value={formData.note} onChange={(e)=>setFormData(v=>({ ...v, note: e.target.value }))} className={inputClass(false)} placeholder="Description" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
            <button type="button" onClick={submit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>Enregistrer</span></button>
          </div>
        </div>
      </Modal>
    )
  }

  const ReportModal = ({ isOpen, onClose, items }) => {
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
          setErr(e.message || 'Erreur chargement détails')
        } finally {
          setLoading(false)
        }
      }
      loadDetails()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, investFilter, items])

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

    const inputClass = `px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={periode==='mensuel' ? 'Rapport mensuel' : 'Rapport annuel'} size="xl">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select value={periode} onChange={(e)=>setPeriode(e.target.value)} className={inputClass}>
              <option value="mensuel">Mensuel</option>
              <option value="annuel">Annuel</option>
            </select>
            <input type="number" value={annee} onChange={(e)=>setAnnee(e.target.value)} className={inputClass} />
            {periode === 'mensuel' && (
              <input type="number" min="1" max="12" value={mois} onChange={(e)=>setMois(e.target.value)} className={inputClass} />
            )}
            <select value={investFilter} onChange={(e)=>setInvestFilter(e.target.value)} className={inputClass}>
              <option value="all">Tous les investissements</option>
              {items.map(it => (
                <option key={it.id} value={it.id}>{it.nom}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={includeVariation} onChange={(e)=>setIncludeVariation(e.target.checked)} />
              Inclure variation de valeur
            </label>
            <button onClick={exportCSV} className="ml-auto px-4 py-2 bg-gray-800 hover:bg-black text-white rounded-lg">Exporter CSV</button>
          </div>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{err}</div>}

          <div className="bg-white rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4">Investissement</th>
                    <th className="text-right py-3 px-4">Revenus</th>
                    <th className="text-right py-3 px-4">Dépenses</th>
                    {includeVariation && <th className="text-right py-3 px-4">Variation valeur</th>}
                    <th className="text-right py-3 px-4">{includeVariation ? 'Net (incl. valeur)' : 'Net'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={includeVariation ? 5 : 4} className="py-8 text-center text-gray-500">Chargement...</td></tr>
                  ) : lignes.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">Aucune donnée</td></tr>
                  ) : lignes.map((l, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4">{l.nom}</td>
                      <td className="py-3 px-4 text-right"><span className="text-emerald-600 font-medium">{l.revenus.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                      <td className="py-3 px-4 text-right"><span className="text-red-600 font-medium">{l.depenses.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                      {includeVariation && (
                        <td className="py-3 px-4 text-right">{l.variation.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                      )}
                      <td className="py-3 px-4 text-right">{(includeVariation ? l.netInclValue : l.net).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="py-3 px-4 text-right">Totaux</td>
                    <td className="py-3 px-4 text-right"><span className="text-emerald-700">{totalRevenusR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    <td className="py-3 px-4 text-right"><span className="text-red-700">{totalDepensesR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    {includeVariation && (
                      <td className="py-3 px-4 text-right">{totalVariationR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    )}
                    <td className="py-3 px-4 text-right">{totalNetR.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
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
            <h1 className="text-3xl font-bold text-gray-900">Investissements</h1>
            <p className="text-gray-600 mt-1">Suivez vos investissements</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button onClick={() => { setEditing(null); setIsFormOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg">
              <Plus className="w-5 h-5" />
              <span>Ajouter un investissement</span>
            </button>
            <button onClick={() => setIsReportOpen(true)} className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg transition-colors shadow">Rapport</button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Total investi</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{totalInvesti.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Revenus - Dépenses</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{(totalRevenus - totalDepenses).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Bénéfice net (incl. valeur)</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{beneficeNet.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Nom</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Type</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-medium">Montant investi</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-medium">Revenus</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-medium">Dépenses</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-medium">Valeur actuelle</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Date d'achat</th>
                  <th className="text-center py-4 px-6 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-500">Aucune position pour le moment</td></tr>
                ) : items.map((it) => (
                  <tr key={it.id_investissement || it.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><TrendingUp className="w-4 h-4" /></div>
                        <div>
                          <p className="font-medium text-gray-900">{it.nom}</p>
            </div>
          </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 capitalize">{it.type}</td>
                    <td className="py-4 px-6 text-right">{Number(it.montant_investi || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className="py-4 px-6 text-right"><span className="text-emerald-600 font-medium">{Number(it.total_revenus || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    <td className="py-4 px-6 text-right"><span className="text-red-600 font-medium">{Number(it.total_depenses || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></td>
                    <td className="py-4 px-6 text-right">{Number((it.valeur_actuelle ?? it.montant_investi) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className="py-4 px-6 text-gray-700">{it.date_achat ? new Date(it.date_achat).toLocaleDateString('fr-FR') : '-'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setRevenueModalFor(it)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Ajouter un revenu">
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExpenseModalFor(it)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ajouter une dépense">
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditing(it); setIsFormOpen(true) }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Modifier">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(it)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
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
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmer la suppression" size="sm">
          <div className="space-y-4">
            <p>Supprimer l'investissement "{deleteTarget?.nom}" ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">Supprimer</button>
          </div>
        </div>
        </Modal>
      </div>
    </div>
  )
}
