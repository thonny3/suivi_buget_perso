"use client"
import { useLanguage } from '@/context/LanguageContext'
import { ArrowRight, Play, Star } from 'lucide-react'
import React from 'react'
import { colors } from '@/styles/colors'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section
      className="relative overflow-hidden py-20 lg:py-32"
      style={{
        backgroundColor: colors.light
      }}
    >
      <div className="absolute inset-0 bg-white/50" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center text-gray-900">
          <div className="text-center lg:text-left">
          {/* Badge de confiance */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-lg border border-green-200 rounded-full px-4 py-2 mb-8 shadow">
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
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight drop-shadow">
            {t('hero.title')}
            <span style={{ color: colors.secondary }}>
              {t('hero.titleHighlight')}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <button 
              className="group text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:-translate-y-0.5 hover:shadow-2xl shadow-xl flex items-center space-x-2"
              style={{ backgroundColor: colors.secondary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
            >
              <span>{t('hero.getStarted')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 font-medium text-lg group">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all border border-green-100">
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
            <div className="relative rounded-[32px] overflow-hidden border border-emerald-100 shadow-2xl bg-white">
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
      <div className="absolute top-20 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-32 right-10 w-32 h-32 bg-emerald-100 rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-green-300 rounded-full opacity-30 animate-bounce"></div>

      {/* Vague décorative */}
      <div className="absolute inset-x-0 bottom-0 text-white" aria-hidden="true">
        <svg viewBox="0 0 1440 320" className="w-full h-48 lg:h-64" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroWavePrimary" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="heroWaveSecondary" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#BBF7D0" stopOpacity="0.45" />
            </linearGradient>
          </defs>
          <path
            d="M0,240 C180,200 360,120 540,140 C720,160 900,260 1080,240 C1260,220 1350,180 1440,160 L1440,320 L0,320 Z"
            fill="url(#heroWaveSecondary)"
          />
          <path
            d="M0,260 C240,220 480,120 720,140 C960,160 1200,260 1440,220 L1440,320 L0,320 Z"
            fill="url(#heroWavePrimary)"
          />
        </svg>
      </div>
    </section>
  )
}
