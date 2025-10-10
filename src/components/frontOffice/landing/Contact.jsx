"use client"
import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (field, value) => setForm(v => ({ ...v, [field]: value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = t('landing.contact.errors.name')
    if (!form.email.trim()) e.email = t('landing.contact.errors.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('landing.contact.errors.emailInvalid')
    if (!form.message.trim() || form.message.trim().length < 10) e.message = t('landing.contact.errors.messageShort')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSent(true)
    }, 600)
  }

  return (
    <section id="contact" className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-white" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" /> {t('landing.contact.badge')}
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">{t('landing.contact.title')}</h2>
          <p className="mt-3 text-gray-600">{t('landing.contact.subtitle')}</p>
        </div>

        {sent ? (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 mt-0.5" />
              <div>
                <h3 className="font-semibold">{t('landing.contact.sent.title')}</h3>
                <p className="text-sm mt-1">{t('landing.contact.sent.desc')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('landing.contact.form.name')}</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e)=>onChange('name', e.target.value)}
                      className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder={t('landing.contact.form.namePlaceholder')}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('landing.contact.form.email')}</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e)=>onChange('email', e.target.value)}
                      className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder={t('landing.contact.form.emailPlaceholder')}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('landing.contact.form.message')}</label>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e)=>onChange('message', e.target.value)}
                    className={`w-full px-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.message ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder={t('landing.contact.form.messagePlaceholder')}
                    aria-invalid={!!errors.message}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <a href="mailto:support@myjalako.app" className="text-sm text-emerald-700 hover:text-emerald-800">{t('landing.contact.mailto')}</a>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 transition-colors ${submitting ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? t('landing.contact.sending') : t('landing.contact.send')}
                  </button>
                </div>
              </form>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-900">{t('landing.contact.details.title')}</h3>
                <p className="mt-2 text-sm text-gray-600">{t('landing.contact.details.subtitle')}</p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{t('landing.contact.details.email')}</p>
                      <a className="text-sm text-emerald-700 hover:text-emerald-800" href="mailto:support@myjalako.app">support@myjalako.app</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{t('landing.contact.details.phone')}</p>
                      <p className="text-sm text-gray-700">+261 00 000 0000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{t('landing.contact.details.address')}</p>
                      <p className="text-sm text-gray-700">Antananarivo, Madagascar</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 rounded-xl bg-emerald-50 text-emerald-900 p-4">
                  <p className="text-sm">{t('landing.contact.tip')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}


