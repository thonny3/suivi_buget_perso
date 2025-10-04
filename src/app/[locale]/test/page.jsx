"use client"
import { useLanguage } from '@/context/LanguageContext'
import { useParams } from 'next/navigation'

export default function TestPage() {
  const { locale } = useParams()
  const { t, currentLanguage } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#426128' }}>
          Test du Système de Langues
        </h1>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Informations de la Route</h2>
            <p><strong>Locale de l'URL :</strong> {locale}</p>
            <p><strong>Langue actuelle :</strong> {currentLanguage}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test des Traductions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Dashboard :</strong> {t('common.dashboard')}</p>
                <p><strong>Login :</strong> {t('common.login')}</p>
                <p><strong>Register :</strong> {t('common.register')}</p>
              </div>
              <div>
                <p><strong>Prénom :</strong> {t('form.prenom')}</p>
                <p><strong>Nom :</strong> {t('form.nom')}</p>
                <p><strong>Email :</strong> {t('form.email')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">URLs de Test</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Français :</strong> <code>/fr/test</code></p>
              <p><strong>Malagasy :</strong> <code>/mg/test</code></p>
              <p><strong>English :</strong> <code>/en/test</code></p>
            </div>
          </div>

          <div className="text-center">
            <a 
              href={`/${locale}/register`}
              className="inline-block bg-[#426128] text-white px-6 py-3 rounded-lg hover:bg-[#2F4A1C] transition-colors"
            >
              Aller à l'inscription
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
