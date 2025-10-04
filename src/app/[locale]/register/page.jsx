"use client"
import LoadingScreen from '@/components/LoadingScreen'
import { useAuth } from '@/app/context/AuthContext'
import { ArrowLeft, Lock, LogIn, User, AlertCircle, Mail, Phone, Eye, EyeOff, DollarSign, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import {signIn} from 'next-auth/react'
import Logo from '@/components/Logo'
import { colors, customClasses } from '@/styles/colors'
import { useLanguage } from '@/context/LanguageContext'
import RedirectIfAuthenticated from '@/components/RedirectIfAuthenticated'
import authService from '@/services/authService'

// Composants d'icônes SVG pour Google et Facebook
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

// Composant Select personnalisé
const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, error }) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none bg-white text-left hover:border-[#93A664] text-sm ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
        >
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors ${
                value === option.value ? 'bg-[#93A664] text-white' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RegisterPage({ params }) {
  const { locale } = params
  const { login, isAuthenticated } = useAuth()
  const { t } = useLanguage()
 
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    currency: 'EUR',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const currencyOptions = [
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'USD', label: 'Dollar US ($)', symbol: '$' },
    { value: 'MGA', label: 'Ariary (Ar)', symbol: 'Ar' },
    { value: 'GBP', label: 'Livre Sterling (£)', symbol: '£' },
    { value: 'JPY', label: 'Yen (¥)', symbol: '¥' }
  ]

  // Loading effet au montage du composant
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      router.push(`/${locale}/dashboard`)
    }
  }, [isAuthenticated, router, locale])

  const returnHome = () => {
    router.push(`/${locale}`)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validation prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = t('form.errors.prenomRequired')
    } else if (formData.prenom.trim().length < 2) {
      newErrors.prenom = t('form.errors.prenomMinLength')
    }
    
    // Validation nom
    if (!formData.nom.trim()) {
      newErrors.nom = t('form.errors.nomRequired')
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = t('form.errors.nomMinLength')
    }
    
    // Validation email
    if (!formData.email) {
      newErrors.email = t('form.errors.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('form.errors.emailInvalid')
    }
    
    // Validation devise
    if (!formData.currency) {
      newErrors.currency = t('form.errors.currencyRequired')
    }
    
    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = t('form.errors.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('form.errors.passwordMinLength')
    }
    
    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('form.errors.confirmPasswordRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('form.errors.passwordMismatch')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Préparer les données pour l'API
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        currency: formData.currency
      }
      
      // Appeler l'API d'inscription
      const result = await authService.register(userData)
      
      if (result.message) {
        // Inscription réussie, rediriger vers la connexion
        console.log('Inscription réussie:', result.message)
        router.push(`/${locale}/connexion`)
      } else {
        // Afficher l'erreur
        setErrors({ general: result.error || 'Erreur lors de l\'inscription' })
      }
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Une erreur est survenue lors de l\'inscription'
      
      if (error.message.includes('déjà utilisé') || error.message.includes('existe déjà')) {
        errorMessage = 'Un compte avec cet email existe déjà. Veuillez utiliser un autre email ou vous connecter.'
      } else if (error.message.includes('Format d\'email invalide')) {
        errorMessage = 'Veuillez entrer une adresse email valide.'
      } else if (error.message.includes('trop court')) {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.'
      } else if (error.message.includes('champs sont requis')) {
        errorMessage = 'Veuillez remplir tous les champs obligatoires.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setErrors({ general: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
   signIn('google', { callbackUrl: `/${locale}/dashboard` })
    console.log('Google login')
  }

  const handleFacebookLogin = () => {
    console.log('Facebook login')
  }

  const handleLoginRedirect = () => {
    router.push(`/${locale}/connexion`)
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  // Si déjà connecté, ne pas afficher le formulaire
  if (isAuthenticated()) {
    return null
  }

  return (
    <RedirectIfAuthenticated locale={locale}>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
        <button
          onClick={returnHome}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.backToHome')}
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="large" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: colors.secondary }}>MyJalako</h1>
          <p className="text-gray-600 mt-1 text-sm">{t('register.subtitle')}</p>
        </div>

        <div className="space-y-2 mb-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-[#DCEDE7] hover:border-[#93A664] transition-colors duration-200 group"
          >
            <GoogleIcon />
            <span className="ml-3 text-gray-700 font-medium text-sm group-hover:text-[#426128]">{t('register.googleSignUp')}</span>
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-[#DCEDE7] hover:border-[#93A664] transition-colors duration-200 group"
          >
            <FacebookIcon />
            <span className="ml-3 text-gray-700 font-medium text-sm group-hover:text-[#426128]">{t('register.facebookSignUp')}</span>
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('common.or')}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Affichage des erreurs générales */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <div className="flex-1">
                  <span className="text-red-700 text-sm">{errors.general}</span>
                  {errors.general.includes('existe déjà') && (
                    <div className="mt-2">
                      <button
                        onClick={() => router.push(`/${locale}/connexion`)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Se connecter avec cet email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('form.prenom')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none text-sm ${
                    errors.prenom ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('form.prenomPlaceholder')}
                />
              </div>
              {errors.prenom && (
                <div className="flex items-center mt-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.prenom}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('form.nom')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none text-sm ${
                    errors.nom ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t('form.nomPlaceholder')}
                />
              </div>
              {errors.nom && (
                <div className="flex items-center mt-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.nom}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('form.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none text-sm ${
                  errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('form.emailPlaceholder')}
              />
            </div>
            {errors.email && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('form.currency')}
            </label>
            <CustomSelect
              value={formData.currency}
              onChange={(value) => handleInputChange('currency', value)}
              options={currencyOptions}
              placeholder={t('form.currencyPlaceholder')}
              icon={DollarSign}
              error={errors.currency}
            />
            {errors.currency && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.currency}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('form.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none text-sm ${
                  errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('form.confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none text-sm ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="flex items-center mt-1 text-red-500 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full text-white py-2.5 px-4 rounded-lg transition-all font-medium transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ 
              backgroundColor: colors.secondary
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            {isSubmitting ? t('register.registering') : t('register.register')}
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            {t('register.haveAccount')}{' '}
            <button 
              onClick={handleLoginRedirect}
              className="font-medium hover:underline"
              style={{ color: colors.secondary }}
            >
              {t('register.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
    </RedirectIfAuthenticated>
  )
}
