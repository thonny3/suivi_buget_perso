"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/app/context/AuthContext'
import apiService from '@/services/apiService'
import useToast from '@/hooks/useToast'
import { colors, customClasses } from '@/styles/colors'
import { API_CONFIG } from '@/config/api'

export default function ProfilPage() {
  const { user: authUser } = useAuth()
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const [form, setForm] = useState({
    id_user: '',
    nom: '',
    prenom: '',
    email: '',
    devise: 'MGA',
    imageUrl: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const API_ORIGIN = API_CONFIG.BASE_URL.replace(/\/api$/, '')

  const buildUploadUrl = (filename) => (filename ? `${API_ORIGIN}/uploads/${filename}` : '')
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        if (authUser) {
          setForm({
            id_user: authUser.id_user ?? '',
            nom: authUser.nom ?? '',
            prenom: authUser.prenom ?? '',
            email: authUser.email ?? '',
            devise: authUser.devise ?? 'MGA',
            imageUrl: authUser.image ? buildUploadUrl(authUser.image) : '',
          })
          setPreviewUrl(authUser.image ? buildUploadUrl(authUser.image) : '')
          return
        }
        const res = await apiService.getCurrentUser()
        const u = res.user
        setForm({
          id_user: u?.id_user ?? '',
          nom: u?.nom ?? '',
          prenom: u?.prenom ?? '',
          email: u?.email ?? '',
          devise: u?.devise ?? 'MGA',
          imageUrl: u?.image ? buildUploadUrl(u.image) : '',
        })
        setPreviewUrl(u?.image ? buildUploadUrl(u.image) : '')
      } catch (e) {
        showError(e.message || 'Impossible de charger le profil')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSelectImage = (e) => {
    const file = e.target.files?.[0]
    setImageFile(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(form.imageUrl)
    }
  }

  const onChangePwd = (e) => {
    const { name, value } = e.target
    setPwd((p) => ({ ...p, [name]: value }))
  }

  const onSubmitPwd = async (e) => {
    e.preventDefault()
    if (!pwd.currentPassword || !pwd.newPassword) {
      showError('Veuillez remplir tous les champs')
      return
    }
    if (pwd.newPassword.length < 6) {
      showError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (pwd.newPassword !== pwd.confirmNewPassword) {
      showError('Les mots de passe ne correspondent pas')
      return
    }
    try {
      setPwdLoading(true)
      await apiService.changePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      showSuccess('Mot de passe mis à jour')
      setPwd({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (e) {
      showError(e.message || 'Échec de la mise à jour du mot de passe')
    } finally {
      setPwdLoading(false)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.id_user) {
      showError("Identifiant utilisateur introuvable")
      return
    }
    try {
      setLoading(true)
      await apiService.updateUser(form.id_user, {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        devise: form.devise,
        imageFile,
      })
      showSuccess('Profil mis à jour')
      const res = await apiService.getCurrentUser()
      const u = res.user
      setForm((f) => ({
        ...f,
        nom: u?.nom ?? f.nom,
        prenom: u?.prenom ?? f.prenom,
        email: u?.email ?? f.email,
        devise: u?.devise ?? f.devise,
        imageUrl: u?.image ? buildUploadUrl(u.image) : f.imageUrl,
      }))
      setPreviewUrl(u?.image ? buildUploadUrl(u.image) : previewUrl)
    } catch (e) {
      showError(e.message || 'Échec de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    const n = form.nom?.charAt(0)?.toUpperCase() || ''
    const p = form.prenom?.charAt(0)?.toUpperCase() || ''
    return n + p
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-[#E8F5E0] px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête avec bannière */}
          <div className="bg-gradient-to-r from-[#426128] to-[#5a8237] rounded-t-2xl h-32 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white overflow-hidden flex items-center justify-center ring-4 ring-white shadow-xl">
                  {previewUrl ? (
                    <img src={previewUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-[#426128]">{getInitials()}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#426128] hover:bg-[#5a8237] rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <input type="file" accept="image/*" onChange={onSelectImage} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Carte principale */}
          <div className="bg-white rounded-b-2xl shadow-xl pt-20 pb-8 px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#426128] mb-2">
                {form.prenom || form.nom ? `${form.prenom} ${form.nom}` : 'Mon Profil'}
              </h1>
              <p className="text-neutral-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {form.email || 'email@exemple.com'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              {/* Section Informations personnelles */}
              <div>
                <h2 className="text-lg font-semibold text-[#426128] mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Informations personnelles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nom
                    </label>
                    <input
                      name="nom"
                      value={form.nom}
                      onChange={onChange}
                      placeholder="Votre nom"
                      className="w-full rounded-lg border-2 border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-[#426128] focus:ring-2 focus:ring-[#426128]/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Prénom
                    </label>
                    <input
                      name="prenom"
                      value={form.prenom}
                      onChange={onChange}
                      placeholder="Votre prénom"
                      className="w-full rounded-lg border-2 border-neutral-200  bg-white px-4 py-3 text-neutral-900  focus:border-[#426128] focus:ring-2 focus:ring-[#426128]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section Contact & Préférences */}
              <div>
                <h2 className="text-lg font-semibold text-[#426128] mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Contact & Préférences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="email@exemple.com"
                      className="w-full rounded-lg border-2 border-neutral-200  bg-white  px-4 py-3 text-neutral-900  focus:border-[#426128] focus:ring-2 focus:ring-[#426128]/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Devise préférée
                    </label>
                    <select
                      name="devise"
                      value={form.devise}
                      onChange={onChange}
                      className="w-full rounded-lg border-2 border-neutral-200  bg-white  px-4 py-3 text-neutral-900  focus:border-[#426128] focus:ring-2 focus:ring-[#426128]/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="MGA">🇲🇬 Ariary Malgache (MGA)</option>
                      <option value="EUR">🇪🇺 Euro (EUR)</option>
                      <option value="USD">🇺🇸 Dollar US (USD)</option>
                      <option value="XOF">🌍 Franc CFA (XOF)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-[#426128] to-[#5a8237] text-white font-semibold hover:from-[#5a8237] hover:to-[#426128] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Changer le mot de passe */}
          <div className="mt-6 bg-white rounded-xl p-6 border-2 border-[#426128]/20">
            <h2 className="text-lg font-semibold text-[#426128] mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 10.5h16.5M6.75 10.5v7.5a2.25 2.25 0 002.25 2.25h5.25a2.25 2.25 0 002.25-2.25v-7.5" />
              </svg>
              Changer le mot de passe
            </h2>
            <form onSubmit={onSubmitPwd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Mot de passe actuel</label>
                <input type="password" name="currentPassword" value={pwd.currentPassword} onChange={onChangePwd} className="w-full rounded-lg border-2 border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-[#426128] focus:ring-2 focus:ring-[#426128]/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nouveau mot de passe</label>
                <input type="password" name="newPassword" value={pwd.newPassword} onChange={onChangePwd} className="w-full rounded-lg border-2 border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-[#426128] focus:ring-2 focus:ring-[#426128]/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Confirmer le nouveau mot de passe</label>
                <input type="password" name="confirmNewPassword" value={pwd.confirmNewPassword} onChange={onChangePwd} className="w-full rounded-lg border-2 border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-[#426128] focus:ring-2 focus:ring-[#426128]/20 outline-none transition-all" />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" disabled={pwdLoading} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#426128] to-[#5a8237] text-white font-semibold disabled:opacity-50">
                  {pwdLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}