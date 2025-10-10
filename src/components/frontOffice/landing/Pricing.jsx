"use client"
import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function Pricing() {
  const { t } = useLanguage()
  const plans = [
    { key: 'free' },
    { key: 'pro' },
    { key: 'enterprise' }
  ].map(({ key }) => ({
    name: t(`landing.pricing.plans.${key}.name`),
    price: t(`landing.pricing.plans.${key}.price`),
    period: t(`landing.pricing.plans.${key}.period`),
    features: t(`landing.pricing.plans.${key}.features`),
    cta: t(`landing.pricing.plans.${key}.cta`)
  }))

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t('landing.pricing.title')}</h2>
          <p className="mt-3 text-gray-600">{t('landing.pricing.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900">{p.name}</h3>
              <div className="mt-4 flex items-end space-x-1">
                <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                <span className="text-gray-500">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-2 text-gray-700">
                {Array.isArray(p.features) ? p.features.map((f) => (<li key={f}>• {f}</li>)) : null}
              </ul>
              <button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors">{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


