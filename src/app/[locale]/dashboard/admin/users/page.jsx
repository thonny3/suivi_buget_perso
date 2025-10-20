"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import adminUsers from '@/services/adminUsersService'
import useToast from '@/hooks/useToast'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { Trash2, ToggleLeft, ToggleRight, Shield } from 'lucide-react'

function AdminUsersContent({ locale }) {
  const router = useRouter()
  const { getCurrentUser } = useAuth()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [onlyActive, setOnlyActive] = useState('all') // 'all' | 'active' | 'inactive'
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [showDelete, setShowDelete] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const list = await adminUsers.list()
        setUsers(Array.isArray(list) ? list : [])
      } catch (e) {
        showError('Erreur lors du chargement des utilisateurs')
        console.error('Erreur:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [showError])

  const toggleActive = async (u) => {
    try {
      await adminUsers.setActive(u.id_user, u.actif ? 0 : 1)
      setUsers(prev => prev.map(x => x.id_user === u.id_user ? { ...x, actif: u.actif ? 0 : 1 } : x))
      showSuccess(u.actif ? 'Utilisateur désactivé' : 'Utilisateur activé')
    } catch (e) {
      showError("Impossible de mettre à jour l'utilisateur")
    }
  }

  const askRemove = (u) => { setDeleteUserId(u.id_user); setShowDelete(true) }
  const confirmRemove = async () => {
    if (!deleteUserId) return
    try {
      await adminUsers.delete(deleteUserId)
      setUsers(prev => prev.filter(x => x.id_user !== deleteUserId))
      showSuccess('Utilisateur supprimé')
    } catch (e) {
      showError('Suppression impossible')
    } finally {
      setShowDelete(false)
      setDeleteUserId(null)
    }
  }
  const cancelRemove = () => { setShowDelete(false); setDeleteUserId(null) }

  if (loading) return <div className="p-6">Chargement…</div>

  const normalized = query.trim().toLowerCase()
  const filtered = users.filter(u => {
    const statusOk = onlyActive === 'all' ? true : (onlyActive === 'active' ? !!u.actif : !u.actif)
    if (!statusOk) return false
    if (!normalized) return true
    const hay = `${u.nom||''} ${u.prenom||''} ${u.email||''} ${u.role||''}`.toLowerCase()
    return hay.includes(normalized)
  })
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <Shield className="w-5 h-5 text-emerald-600 mr-2" />
        <h1 className="text-xl font-semibold">Administration — Utilisateurs</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-gray-100">
          <div className="flex gap-2 items-center">
            <input
              value={query}
              onChange={e=>{ setQuery(e.target.value); setPage(1) }}
              placeholder="Rechercher (nom, email, rôle)"
              className="border rounded-lg px-3 py-2 w-64"
            />
            <select value={onlyActive} onChange={e=>{ setOnlyActive(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2">
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">{total} résultat(s)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Nom</th>
                <th className="text-left p-4 font-medium text-gray-700">Prénom</th>
                <th className="text-left p-4 font-medium text-gray-700">Email</th>
                <th className="text-left p-4 font-medium text-gray-700">Rôle</th>
                <th className="text-left p-4 font-medium text-gray-700">Actif</th>
                <th className="text-center p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u, index) => (
                <tr key={u.id_user} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4">{u.nom || '-'}</td>
                  <td className="p-4">{u.prenom || '-'}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">{u.actif ? 'Oui' : 'Non'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => toggleActive(u)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" aria-label="Activer/Désactiver">
                        {u.actif ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => askRemove(u)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Supprimer">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun utilisateur</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Affichage {start + 1}–{Math.min(start + pageSize, total)} sur {total}
          </div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={()=>setPage(p=>Math.max(1, p-1))} className={`px-3 py-1 rounded-lg border ${currentPage===1?'opacity-50 cursor-not-allowed':'hover:bg-gray-50'}`}>Précédent</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage-3), Math.max(0, currentPage-3)+5).map(pn => (
              <button key={pn} onClick={()=>setPage(pn)} className={`px-3 py-1 rounded-lg border ${pn===currentPage?'bg-emerald-600 text-white border-emerald-600':'hover:bg-gray-50'}`}>{pn}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))} className={`px-3 py-1 rounded-lg border ${currentPage===totalPages?'opacity-50 cursor-not-allowed':'hover:bg-gray-50'}`}>Suivant</button>
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
    </div>
  )
}

export default function AdminUsersPage({ params }) {
  const { locale } = params
  
  return (
    <AdminProtectedRoute locale={locale}>
      <AdminUsersContent locale={locale} />
    </AdminProtectedRoute>
  )
}
