"use client"
import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Wallet, Calendar, Save, X, DollarSign } from 'lucide-react'
import dettesService from '@/services/dettesService'
import depensesService from '@/services/depensesService'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const DetteForm = ({ isOpen, onClose, onSave, item = null }) => {
  const [formData, setFormData] = useState({
    nom: item?.nom || '',
    montant_initial: item?.montant_initial || '',
    montant_restant: item?.montant_restant ?? item?.montant_initial ?? '',
    taux_interet: item?.taux_interet ?? 0,
    date_debut: item?.date_debut ? new Date(item.date_debut).toISOString().slice(0,10) : new Date().toISOString().slice(0,10),
    date_fin_prevue: item?.date_fin_prevue ? new Date(item.date_fin_prevue).toISOString().slice(0,10) : '',
    paiement_mensuel: item?.paiement_mensuel ?? 0,
    creancier: item?.creancier || '',
    statut: item?.statut || 'en cours',
    type: item?.type || 'personne'
  })
  const [errors, setErrors] = useState({})

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
      statut: item?.statut || 'en cours',
      type: item?.type || 'personne'
    })
  }, [item])

  const validate = () => {
    const e = {}
    if (!formData.nom.trim()) e.nom = 'Nom requis'
    if (!formData.montant_initial || Number(formData.montant_initial) <= 0) e.montant_initial = 'Montant initial > 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      nom: formData.nom,
      montant_initial: Number(formData.montant_initial),
      montant_restant: formData.montant_restant === '' ? undefined : Number(formData.montant_restant),
      taux_interet: Number(formData.taux_interet || 0),
      date_debut: formData.date_debut,
      date_fin_prevue: formData.date_fin_prevue || null,
      paiement_mensuel: Number(formData.paiement_mensuel || 0),
      creancier: formData.creancier,
      statut: formData.statut,
      type: formData.type
    })
    onClose()
  }

  const inputClass = (hasError) => `w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Modifier la dette' : 'Nouvelle dette'} size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input type="text" value={formData.nom} onChange={(e)=>setFormData(v=>({ ...v, nom: e.target.value }))} className={inputClass(!!errors.nom)} placeholder="Ex: Prêt bancaire" />
          {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant initial</label>
            <input type="number" step="0.01" value={formData.montant_initial} onChange={(e)=>setFormData(v=>({ ...v, montant_initial: e.target.value }))} className={inputClass(!!errors.montant_initial)} placeholder="0.00" />
            {errors.montant_initial && <p className="text-red-500 text-sm mt-1">{errors.montant_initial}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant restant</label>
            <input type="number" step="0.01" value={formData.montant_restant} onChange={(e)=>setFormData(v=>({ ...v, montant_restant: e.target.value }))} className={inputClass(false)} placeholder="Laisser vide pour égal au montant initial" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taux d'intérêt (%)</label>
            <input type="number" step="0.01" value={formData.taux_interet} onChange={(e)=>setFormData(v=>({ ...v, taux_interet: e.target.value }))} className={inputClass(false)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paiement mensuel</label>
            <input type="number" step="0.01" value={formData.paiement_mensuel} onChange={(e)=>setFormData(v=>({ ...v, paiement_mensuel: e.target.value }))} className={inputClass(false)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input type="date" value={formData.date_debut} onChange={(e)=>setFormData(v=>({ ...v, date_debut: e.target.value }))} className={inputClass(false)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date fin prévue</label>
            <input type="date" value={formData.date_fin_prevue} onChange={(e)=>setFormData(v=>({ ...v, date_fin_prevue: e.target.value }))} className={inputClass(false)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Créancier</label>
            <input type="text" value={formData.creancier} onChange={(e)=>setFormData(v=>({ ...v, creancier: e.target.value }))} className={inputClass(false)} placeholder="Banque, personne..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select value={formData.type} onChange={(e)=>setFormData(v=>({ ...v, type: e.target.value }))} className={inputClass(false)}>
              <option value="personne">Personne</option>
              <option value="banque">Banque</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
          <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>{item ? 'Mettre à jour' : 'Ajouter'}</span></button>
        </div>
      </div>
    </Modal>
  )
}

const PaiementForm = ({ isOpen, onClose, onSave, dette }) => {
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

  const submit = () => {
    if (!formData.montant || Number(formData.montant) <= 0) { setError('Montant invalide'); return }
    if (!formData.date_paiement) { setError('Date requise'); return }
    onSave({
      montant: Number(formData.montant),
      date_paiement: formData.date_paiement,
      id_compte: formData.id_compte ? Number(formData.id_compte) : undefined
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ajouter un paiement — ${dette?.nom || ''}`} size="md">
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
          <input type="number" step="0.01" value={formData.montant} onChange={(e)=>setFormData(v=>({ ...v, montant: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date de paiement</label>
          <input type="date" value={formData.date_paiement} onChange={(e)=>setFormData(v=>({ ...v, date_paiement: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Compte (optionnel)</label>
          <select value={formData.id_compte} onChange={(e)=>setFormData(v=>({ ...v, id_compte: e.target.value }))} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
            <option value="">Sélectionner un compte</option>
            {comptes.map((c) => (
              <option key={(c.id_compte ?? c.id)} value={(c.id_compte ?? c.id)}>{c.nom} ({c.type})</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Annuler</button>
          <button type="button" onClick={submit} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>Enregistrer</span></button>
        </div>
      </div>
    </Modal>
  )
}

export default function DettesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [target, setTarget] = useState(null)

  const load = async () => {
    try {
      setError('')
      setLoading(true)
      const res = await dettesService.getDettes()
      setItems(Array.isArray(res) ? res : [])
    } catch (e) {
      setError(e.message || 'Erreur lors du chargement des dettes')
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
        } catch (_) {}
      })()
    }
  }, [])

  const handleSave = async (payload) => {
    try {
      setError('')
      // Déduire automatiquement le statut selon règles métier
      const remaining = Number(payload?.montant_restant ?? payload?.montant_initial ?? 0)
      const initial = Number(payload?.montant_initial ?? 0)
      const deadline = payload?.date_fin_prevue ? new Date(payload.date_fin_prevue) : null
      const today = new Date()
      let derived = 'en cours'
      if (deadline && !isNaN(deadline) && deadline < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        derived = 'en retard'
      }
      if (!Number.isNaN(remaining) && !Number.isNaN(initial) && remaining === initial) {
        derived = 'terminé'
      }
      const withStatus = { ...payload, statut: derived }
      if (editing) {
        await dettesService.updateDette(editing.id_dette, withStatus)
      } else {
        await dettesService.createDette(withStatus)
      }
      await load()
    } catch (e) {
      setError(e.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setEditing(null)
    }
  }

  const handleDelete = async (dette) => {
    if (!confirm(`Supprimer la dette "${dette.nom}" ?`)) return
    try {
      setError('')
      await dettesService.deleteDette(dette.id_dette)
      await load()
    } catch (e) {
      setError(e.message || 'Erreur lors de la suppression')
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
      await load()
    } catch (e) {
      setError(e.message || 'Erreur lors de l\'ajout du paiement')
    } finally {
      setTarget(null)
    }
  }

  const totalRestant = items.reduce((s, d) => s + Number(d.montant_restant || 0), 0)
  const totalInitial = items.reduce((s, d) => s + Number(d.montant_initial || 0), 0)

  // Statut dérivé pour affichage
  const deriveStatus = (d) => {
    const remaining = Number(d?.montant_restant ?? 0)
    const initial = Number(d?.montant_initial ?? 0)
    const deadline = d?.date_fin_prevue ? new Date(d.date_fin_prevue) : null
    const today = new Date()
    if (deadline && !isNaN(deadline) && deadline < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      return 'en retard'
    }
    if (!Number.isNaN(remaining) && !Number.isNaN(initial) && remaining === initial) return 'terminé'
    return 'en cours'
  }

  // Pagination
  const totalPages = Math.ceil(items.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage)
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))
  const goTo = (n) => setCurrentPage(n)

  const renderStatusBadge = (status) => {
    const map = {
      'terminé': { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminé' },
      'en retard': { bg: 'bg-red-100', text: 'text-red-700', label: 'En retard' },
      'en cours': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En cours' }
    }
    const s = map[status] || map['en cours']
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Dettes</h1>
            <p className="text-gray-600 mt-1">Suivez vos dettes et remboursements</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button onClick={() => { setEditing(null); setIsFormOpen(true) }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg">
              <Plus className="w-5 h-5" /><span>Nouvelle dette</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Montant initial total</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{totalInitial.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Montant restant total</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{totalRestant.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Nombre de dettes</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{items.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Nom</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Créancier</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-medium">Montant initial</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-medium">Restant</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Dates</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Statut</th>
                  <th className="text-center py-4 px-6 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-500">Chargement...</td></tr>
                ) : paginatedItems.map((d) => (
                  <tr key={d.id_dette} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><Wallet className="w-4 h-4" /></div>
                        <div>
                          <p className="font-medium text-gray-900">{d.nom}</p>
                          <p className="text-sm text-gray-500">{d.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{d.creancier || '-'}</td>
                    <td className="py-4 px-6 text-right">{Number(d.montant_initial || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6 text-right">{Number(d.montant_restant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-4 px-6 text-gray-700">
                      <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span>Début: {d.date_debut ? new Date(d.date_debut).toLocaleDateString('fr-FR') : '-'}</span></div>
                      <div className="flex items-center space-x-2 mt-1"><Calendar className="w-4 h-4 text-gray-400" /><span>Fin prévue: {d.date_fin_prevue ? new Date(d.date_fin_prevue).toLocaleDateString('fr-FR') : '-'}</span></div>
                    </td>
                    <td className="py-4 px-6">
                      {renderStatusBadge(deriveStatus(d))}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => { setEditing(d); setIsFormOpen(true) }} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Modifier"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(d)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                        <button onClick={() => { setTarget(d); setIsPaymentOpen(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ajouter un paiement"><DollarSign className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot></tfoot>
            </table>
          </div>
        </div>

        {/* Pagination alignée sur Dépenses */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, items.length)} sur {items.length} résultats
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={goPrev}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-500">Page {currentPage} / {totalPages}</span>
              <button
                onClick={goNext}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        <DetteForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditing(null) }} onSave={handleSave} item={editing} />
        <PaiementForm isOpen={isPaymentOpen} onClose={() => { setIsPaymentOpen(false); setTarget(null) }} onSave={savePayment} dette={target} />
      </div>
    </div>
  )
}


