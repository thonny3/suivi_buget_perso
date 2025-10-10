"use client"
import { useLanguage } from '@/context/LanguageContext'
import { ArrowRight, Play, Star } from 'lucide-react'
import React from 'react'
import { colors } from '@/styles/colors'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden py-20 lg:py-32" style={{ backgroundColor: colors.light }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
          {/* Badge de confiance */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-green-200 rounded-full px-4 py-2 mb-8 shadow-sm">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {t('hero.trustBadge')}
            </span>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}
            <span style={{ color: colors.secondary }}>
              {t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <button 
              className="group text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
              style={{ backgroundColor: colors.secondary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
            >
              <span>{t('hero.getStarted')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 font-medium text-lg group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Play className="w-5 h-5 ml-1" style={{ color: colors.secondary }} />
              </div>
              <span>{t('hero.watchDemo')}</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto lg:mx-0">
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold mb-2" style={{ color: colors.secondary }}>10K+</div>
              <div className="text-gray-600">{t('hero.stats.users')}</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold mb-2" style={{ color: colors.secondary }}>50M+</div>
              <div className="text-gray-600">{t('hero.stats.transactions')}</div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-3xl font-bold mb-2" style={{ color: colors.secondary }}>99.9%</div>
              <div className="text-gray-600">{t('hero.stats.uptime')}</div>
            </div>
          </div>
          </div>

          {/* Illustration */}
          <div className="relative block mt-10 lg:mt-0">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-100 rounded-3xl rotate-6 opacity-70"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-green-100 rounded-full opacity-60"></div>
            <div className="relative rounded-3xl overflow-hidden border border-emerald-100 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&auto=format&fit=crop"
                alt={t('hero.imageAlt')}
                className="w-full h-[420px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Éléments décoratifs */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-green-300 rounded-full opacity-30 animate-bounce"></div>
    </section>
  )
}
