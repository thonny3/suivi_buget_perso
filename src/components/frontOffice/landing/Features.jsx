import { Award, BarChart3, Calendar, Globe, PieChart, Shield, Smartphone, Target, TrendingUp } from 'lucide-react';
import React from 'react'
import { colors } from '@/styles/colors'
import { useLanguage } from '@/context/LanguageContext'

export default function Features() {
  const { t } = useLanguage()
  const features = [
    { icon: PieChart, title: t('landing.features.items.budget.title'), description: t('landing.features.items.budget.description') },
    { icon: TrendingUp, title: t('landing.features.items.income.title'), description: t('landing.features.items.income.description') },
    { icon: Target, title: t('landing.features.items.goals.title'), description: t('landing.features.items.goals.description') },
    { icon: Calendar, title: t('landing.features.items.subscriptions.title'), description: t('landing.features.items.subscriptions.description') },
    { icon: BarChart3, title: t('landing.features.items.analytics.title'), description: t('landing.features.items.analytics.description') },
    { icon: Shield, title: t('landing.features.items.security.title'), description: t('landing.features.items.security.description') },
    { icon: Smartphone, title: t('landing.features.items.usability.title'), description: t('landing.features.items.usability.description') },
    { icon: Globe, title: t('landing.features.items.global.title'), description: t('landing.features.items.global.description') },
    { icon: Award, title: t('landing.features.items.trust.title'), description: t('landing.features.items.trust.description') }
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border group"
                style={{ backgroundColor: colors.white, borderColor: colors.light }}
              >
                <div className="rounded-xl p-3 w-fit mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: colors.secondary }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  )
}
