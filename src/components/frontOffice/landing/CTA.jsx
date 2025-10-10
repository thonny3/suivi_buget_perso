"use client"
import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function CTA() {
  const { t, currentLanguage } = useLanguage()
  const locale = currentLanguage
  return (
    <section id="cta" className="py-16 bg-emerald-600">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white">{t('landing.cta.title')}</h2>
        <p className="mt-3 text-emerald-50">{t('landing.cta.subtitle')}</p>
        <div className="mt-6 flex items-center justify-center space-x-3">
          <Link href={`/${locale}/register`} className="bg-white text-emerald-700 font-semibold px-6 py-2 rounded-lg hover:bg-emerald-50 transition-colors">{t('landing.cta.createAccount')}</Link>
          <Link href={`/${locale}/connexion`} className="bg-emerald-700 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition-colors">{t('common.login')}</Link>
        </div>
      </div>
    </section>
  )
}


