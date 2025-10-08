"use client"
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import useToast from '@/hooks/useToast'

export default function ProfilProPage() {
  const { showSuccess } = useToast()
  const [form, setForm] = useState({
    entreprise: '',
    poste: '',
    telephone: '',
    siteWeb: '',
    adresse: '',
    bio: '',
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('profilPro')
      if (saved) {
        setForm(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('profilPro', JSON.stringify(form))
    showSuccess('Profil professionnel enregistré')
  }

  return (
    <ProtectedRoute>
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Profil professionnel</h1>

        <form onSubmit={onSubmit} className="space-y-6 bg-white/50 dark:bg-neutral-900/40 rounded-lg p-4 border border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Entreprise</label>
              <input name="entreprise" value={form.entreprise} onChange={onChange} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Poste</label>
              <input name="poste" value={form.poste} onChange={onChange} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Téléphone</label>
              <input name="telephone" value={form.telephone} onChange={onChange} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Site web</label>
              <input name="siteWeb" value={form.siteWeb} onChange={onChange} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Adresse</label>
            <input name="adresse" value={form.adresse} onChange={onChange} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <textarea name="bio" rows={5} value={form.bio} onChange={onChange} className="mt-1 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2" />
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center rounded-md bg-blue-600 text-white px-4 py-2">Enregistrer</button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}


