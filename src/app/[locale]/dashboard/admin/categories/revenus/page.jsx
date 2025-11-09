"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import adminCategories from '@/services/adminCategoriesService'
import useToast from '@/hooks/useToast'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { Plus, Trash2, Tag, Pencil } from 'lucide-react'

function AdminCategoriesRevenusContent({ locale }) {
  const router = useRouter()
  const { getCurrentUser } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [nom, setNom] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const list = await adminCategories.listRevenus()
        setItems(Array.isArray(list) ? list : [])
      } catch {
        router.push(`/${locale}/dashboard`)
      } finally {
        setLoading(false)
      }
    })()
  }, [getCurrentUser, locale, router])

  const add = async () => {
    if (!nom.trim()) return
    try {
      if (editId) {
        await adminCategories.updateRevenu(editId, nom.trim())
        setItems(prev => prev.map(x => x.id === editId ? { ...x, nom: nom.trim() } : x))
      } else {
        const r = await adminCategories.addRevenu(nom.trim())
        setItems(prev => [...prev, { id: r.id, nom: nom.trim() }])
      }
      setNom('')
      showSuccess('Catégorie ajoutée')
      setShowModal(false)
      setEditId(null)
    } catch { showError('Ajout impossible') }
  }
  const askRemove = (id) => { setDeleteId(id); setShowDelete(true) }
  const confirmRemove = async () => {
    if (!deleteId) return
    try {
      await adminCategories.deleteRevenu(deleteId)
      setItems(prev => prev.filter(x => x.id !== deleteId))
      showSuccess('Catégorie supprimée')
    } catch { showError('Suppression impossible') }
    finally { setShowDelete(false); setDeleteId(null) }
  }
  const cancelRemove = () => { setShowDelete(false); setDeleteId(null) }

  if (loading) return <div className="p-6">Chargement…</div>

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <Tag className="w-5 h-5 text-emerald-600 mr-2" />
        <h1 className="text-xl font-semibold">Catégories — Revenus</h1>
      </div>
      <div className="flex justify-end mb-4">
        <button onClick={()=>setShowModal(true)} className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"><Plus className="w-4 h-4 mr-1"/>Ajouter une catégorie</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-gray-100">
          <input
            value={query}
            onChange={e=>{ setQuery(e.target.value); setPage(1) }}
            className="border rounded-lg px-3 py-2 w-full md:w-64"
            placeholder="Rechercher une catégorie…"
          />
          <div className="text-sm text-gray-600">{items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).length} résultat(s)</div>
        </div>
        <div className="overflow-x-auto custom-scrollbar scroll-smooth">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Nom</th>
                <th className="text-center p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map((it, index) => (
                <tr key={it.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{it.nom}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={()=>{ setEditId(it.id); setNom(it.nom); setShowModal(true) }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" aria-label="Modifier">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={()=>askRemove(it.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucune catégorie</div>
        )}
      </div>

      {Math.ceil(items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).length / pageSize) > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {(() => {
              const count = items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).length
              const from = (page-1)*pageSize + 1
              const to = Math.min(page*pageSize, count)
              return `Affichage ${from}–${to} sur ${count}`
            })()}
          </div>
          <div className="flex items-center gap-2">
            <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className={`px-3 py-1 rounded-lg border ${page===1?'opacity-50 cursor-not-allowed':'hover:bg-gray-50'}`}>Précédent</button>
            {Array.from({ length: Math.ceil(items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).length / pageSize) }, (_, i) => i + 1).slice(Math.max(0, page-3), Math.max(0, page-3)+5).map(pn => (
              <button key={pn} onClick={()=>setPage(pn)} className={`px-3 py-1 rounded-lg border ${pn===page?'bg-emerald-600 text-white border-emerald-600':'hover:bg-gray-50'}`}>{pn}</button>
            ))}
            <button disabled={page===Math.ceil(items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).length / pageSize)} onClick={()=>setPage(p=>Math.min(Math.ceil(items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).length / pageSize), p+1))} className={`px-3 py-1 rounded-lg border ${page===Math.ceil(items.filter(x=>x.nom?.toLowerCase().includes(query.trim().toLowerCase())).length / pageSize)?'opacity-50 cursor-not-allowed':'hover:bg-gray-50'}`}>Suivant</button>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h2>
              <p className="text-sm text-gray-500">Cette action est irréversible.</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={cancelRemove} className="px-4 py-2 rounded-lg border">Annuler</button>
              <button onClick={confirmRemove} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Modifier la catégorie' : 'Ajouter une catégorie revenu'}</h2>
              <p className="text-sm text-gray-500">Définissez un nom clair et descriptif.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input value={nom} onChange={e=>setNom(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ex: Salaire, Prime…" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={()=>{ setShowModal(false); setNom(''); setEditId(null) }} className="px-4 py-2 rounded-lg border">Annuler</button>
              <button onClick={add} className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                {editId ? 'Enregistrer' : (<><Plus className="w-4 h-4 mr-1"/>Ajouter</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCategoriesRevenusPage({ params }) {
  const { locale } = params
  
  return (
    <AdminProtectedRoute locale={locale}>
      <AdminCategoriesRevenusContent locale={locale} />
    </AdminProtectedRoute>
  )
}
