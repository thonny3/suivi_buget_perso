"use client"
import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const year = new Date().getFullYear()
  const { t, currentLanguage } = useLanguage()
  const locale = currentLanguage
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('landing.footer.brand')}</h3>
            <p className="mt-2 text-sm text-gray-600">{t('landing.footer.tagline')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{t('landing.footer.product')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-emerald-700" href="#features">{t('landing.footer.features')}</a></li>
              <li><Link className="hover:text-emerald-700" href={`/${locale}/connexion`}>{t('common.login')}</Link></li>
              <li><Link className="hover:text-emerald-700" href={`/${locale}/register`}>{t('common.register')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{t('landing.footer.resources')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-emerald-700" href="#faq">FAQ</a></li>
              <li><a className="hover:text-emerald-700" href="#contact">{t('landing.footer.contact')}</a></li>
              <li><a className="hover:text-emerald-700" href="#support">{t('landing.footer.support')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{t('landing.footer.legal')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-emerald-700" href="#privacy">{t('landing.footer.privacy')}</a></li>
              <li><a className="hover:text-emerald-700" href="#terms">{t('landing.footer.terms')}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
          <p>© {year} {t('landing.footer.brand')}. {t('landing.footer.rights')}</p>
          <div className="mt-3 md:mt-0 space-x-4">
            <a className="hover:text-emerald-700" href="#">Facebook</a>
            <a className="hover:text-emerald-700" href="#">Twitter</a>
            <a className="hover:text-emerald-700" href="#">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


