"use client"
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Mail, Loader2, CheckCircle2, AlertTriangle, KeySquare } from 'lucide-react'
import authForgotService from '@/services/authForgotService'
import useToast from '@/hooks/useToast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const { showSuccess, showError } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const locale = (pathname || '/mg').split('/').filter(Boolean)[0] || 'mg'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Veuillez saisir votre email')
      return
    }
    try {
      setLoading(true)
      const resp = await authForgotService.forgotPassword(email.trim())
      // eslint-disable-next-line no-console
      console.log('[ForgotPassword] response:', resp)
      setSuccess("Si un compte existe, un email de réinitialisation a été envoyé.")
      try { showSuccess(resp?.message || 'Email envoyé si le compte existe') } catch {}
      setOtpSent(false)
    } catch (err) {
      setError(err?.message || "Une erreur est survenue")
      try { showError(err?.message || 'Une erreur est survenue') } catch {}
    } finally {
      setLoading(false)
    }
  }

  const onSendOtp = async () => {
    setError('')
    setSuccess('')
    if (!email.trim()) { setError('Veuillez saisir votre email'); return }
    try {
      setLoading(true)
      const resp = await authForgotService.requestOtp(email.trim())
      // eslint-disable-next-line no-console
      console.log('[ForgotPassword OTP] response:', resp)
      setSuccess('Code OTP envoyé. Vérifiez votre boîte mail.')
      try { showSuccess(resp?.message || 'Code OTP envoyé') } catch {}
      setOtpSent(true)
      // Rediriger directement vers la page de saisie OTP + nouveau mot de passe
      try {
        router.push(`/${locale}/reset-password?mode=otp&email=${encodeURIComponent(email.trim())}`)
      } catch {}
    } catch (err) {
      setError(err?.message || 'Impossible d\'envoyer le code')
      try { showError(err?.message || 'Impossible d\'envoyer le code') } catch {}
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center">
            <Mail className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mot de passe oublié</h1>
            <p className="text-sm text-gray-600">Recevez un lien de réinitialisation par email</p>
          </div>
        </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="votre.email@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Envoyer le lien
          </button>
          <div className="text-center text-xs text-gray-500">ou</div>
          <button
            type="button"
            onClick={onSendOtp}
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeySquare className="w-4 h-4 mr-2" />}
            Recevoir un code OTP
          </button>
          {otpSent && (
            <p className="text-xs text-gray-600 text-center">Entrez le code sur la page de réinitialisation OTP.</p>
          )}
        </form>
      </div>
    </div>
  )
}


