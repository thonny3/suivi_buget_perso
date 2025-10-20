"use client"
import React, { useState, useEffect } from 'react'
import { KeyRound, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import authForgotService from '@/services/authForgotService'
import useToast from '@/hooks/useToast'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [useOtp, setUseOtp] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const locale = (pathname || '/mg').split('/').filter(Boolean)[0] || 'mg'

  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const t = url.searchParams.get('token') || ''
      setToken(t)
      const mode = url.searchParams.get('mode') || ''
      if (mode === 'otp') setUseOtp(true)
      const prefillEmail = url.searchParams.get('email') || ''
      if (prefillEmail) setEmail(prefillEmail)
    } catch {}
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!useOtp && !token) { setError('Lien invalide ou manquant'); return }
    if (useOtp) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Email invalide'); return }
      if (!code || code.length !== 6) { setError('Code OTP invalide'); return }
    }
    if (!newPassword || newPassword.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return }
    if (newPassword !== confirm) { setError('Les mots de passe ne correspondent pas'); return }

    try {
      setLoading(true)
      let resp
      if (useOtp) {
        resp = await authForgotService.resetWithOtp(email.trim(), code.trim(), newPassword)
      } else {
        resp = await authForgotService.resetPassword(token, newPassword)
      }
      // eslint-disable-next-line no-console
      console.log('[ResetPassword] response:', resp)
      setSuccess('Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.')
      try { showSuccess(resp?.message || 'Mot de passe réinitialisé') } catch {}
      setNewPassword('')
      setConfirm('')
      try { router.push(`/${locale}/connexion`) } catch {}
    } catch (err) {
      setError(err?.message || 'Impossible de réinitialiser le mot de passe')
      try { showError(err?.message || 'Impossible de réinitialiser le mot de passe') } catch {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Réinitialiser le mot de passe</h1>
            <p className="text-sm text-gray-600">Définissez un nouveau mot de passe sécurisé</p>
          </div>
        </div>
        {useOtp && (
          <div className="space-y-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="votre.email@example.com"
              disabled
              readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code OTP (6 chiffres)</label>
              <input
                type="text"
                value={code}
                onChange={(e)=>setCode(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest"
                placeholder="000000"
                inputMode="numeric"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start space-x-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-start space-x-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e)=>setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pr-10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="******"
              />
              <button
                type="button"
                onClick={()=>setShowNew(v=>!v)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showNew ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pr-10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="******"
              />
              <button
                type="button"
                onClick={()=>setShowConfirm(v=>!v)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Enregistrer le nouveau mot de passe
          </button>
        </form>
      </div>
    </div>
  )
}


