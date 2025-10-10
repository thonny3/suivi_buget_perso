"use client"
import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function FAQ() {
  const { t } = useLanguage()
  const items = t('landing.faq.items')
  const faqs = Array.isArray(items) ? items : []
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">{t('landing.faq.title')}</h2>
          <p className="mt-3 text-gray-600">{t('landing.faq.subtitle')}</p>
        </div>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="bg-white border border-gray-200 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-900">{f.q}</summary>
              <p className="mt-2 text-gray-700">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}


