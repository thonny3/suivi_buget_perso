"use client"
import React from 'react'
import { Shield, Lock, Database } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function Security() {
  const { t } = useLanguage()
  const items = [
    { icon: Shield, title: t('landing.security.items.protection.title'), text: t('landing.security.items.protection.text') },
    { icon: Lock, title: t('landing.security.items.access.title'), text: t('landing.security.items.access.text') },
    { icon: Database, title: t('landing.security.items.backups.title'), text: t('landing.security.items.backups.text') }
  ]
  return (
    <section id="securite" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t('landing.security.title')}</h2>
          <p className="mt-3 text-gray-600">{t('landing.security.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 inline-block"><Icon className="w-5 h-5" /></div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


