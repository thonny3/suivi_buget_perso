"use client"
import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function Testimonials() {
  const { t } = useLanguage()
  const rawItems = t('landing.testimonials.items')
  const items = Array.isArray(rawItems) ? rawItems : []
  return (
    <section id="temoignages" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t('landing.testimonials.title')}</h2>
          <p className="mt-3 text-gray-600">{t('landing.testimonials.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((tst) => (
            <div key={tst.name} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                {tst.photo && (
                  <img
                    src={tst.photo}
                    alt={t('landing.testimonials.photoAlt', { name: tst.name })}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-100"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="text-gray-800">“{tst.text}”</p>
                  <div className="mt-4">
                    <p className="font-semibold text-gray-900">{tst.name}</p>
                    <p className="text-sm text-gray-600">{tst.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


