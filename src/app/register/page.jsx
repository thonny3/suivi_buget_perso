"use client"
import LoadingScreen from '@/components/LoadingScreen'
import { useAuth } from '@/app/context/AuthContext'
import { ArrowLeft, DollarSign, Lock, Mail, User, UserPlus, ChevronDown, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import authService from '@/services/authService'
import toast, { Toaster } from 'react-hot-toast'
import Logo from '@/components/Logo'
import { colors, customClasses } from '@/styles/colors'

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
          className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none bg-white text-left hover:border-green-400 text-sm ${
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
              className="w-full px-4 py-2.5 text-left hover:bg-green-50 hover:text-green-700 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{option.flag}</span>
                <div>
                  <div className="font-medium text-sm">{option.currency}</div>
                  <div className="text-xs text-gray-500 group-hover:text-green-600">{option.name}</div>
                </div>
              </div>
              {value === option.value && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PageRegister() {
  const { login, isAuthenticated } = useAuth()
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
    {
      value: 'EUR',
      label: 'Euro (€)',
      currency: 'EUR - €',
      name: 'Euro',
      flag: '🇪🇺'
    },
    {
      value: 'USD',
      label: 'Dollar ($)',
      currency: 'USD - $',
      name: 'Dollar Américain',
      flag: '🇺🇸'
    },
    {
      value: 'MGA',
      label: 'Ariary Malagasy (Ar)',
      currency: 'MGA - Ar',
      name: 'Ariary Malagasy',
      flag: '🇲🇬'
    }
  ]

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])


  const returnHome = () => {
    router.push('/')
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
      newErrors.prenom = 'Ny anarana dia ilaina'
    } else if (formData.prenom.trim().length < 2) {
      newErrors.prenom = 'Ny anarana dia tokony ho 2 na mihoatra'
    }
    
    // Validation nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Ny anarana raibe dia ilaina'
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Ny anarana raibe dia tokony ho 2 na mihoatra'
    }
    
    // Validation email
    if (!formData.email) {
      newErrors.email = 'Ny mailaka dia ilaina'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ny mailaka dia tsy marina'
    }
    
    // Validation devise
    if (!formData.currency) {
      newErrors.currency = 'Ny vola dia ilaina'
    }
    
    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Ny teny miafina dia ilaina'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Ny teny miafina dia tokony ho 6 na mihoatra'
    }
    
    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Ny fanamarinana dia ilaina'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Ny teny miafina dia tsy mitovy'
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
      const response = await authService.register(userData)
      
      // Afficher le message de succès
      toast.success('Inscription réussie ! Redirection vers la page de connexion...')
      
      // Attendre un peu pour que l'utilisateur voie le message
      setTimeout(() => {
        // Rediriger vers la page de connexion
        router.push('/connexion')
      }, 2000)
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      toast.error(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = () => {
    toast.error('Connexion Google non disponible pour le moment')
  }

  const handleFacebookSignup = () => {
    toast.error('Connexion Facebook non disponible pour le moment')
  }

  // Loading effet au montage du composant
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Réduit de 2s à 1.5s

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  // Si déjà connecté, ne pas afficher le formulaire
  if (isAuthenticated()) {
    return null
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#059669',
              border: '1px solid #10b981',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#dc2626',
              border: '1px solid #ef4444',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <button
          onClick={returnHome}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="large" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: colors.secondary }}>MyJalako</h1>
          <p className="text-gray-600 mt-1 text-sm">Mamorona ny kaontinao</p>
        </div>

        {/* Boutons de connexion sociale */}
        <div className="space-y-2 mb-4">
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-[#DCEDE7] hover:border-[#93A664] transition-colors duration-200 group"
          >
            <GoogleIcon />
            <span className="ml-3 text-gray-700 font-medium text-sm group-hover:text-[#426128]">S'inscrire avec Google</span>
          </button>

          <button
            onClick={handleFacebookSignup}
            className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-[#DCEDE7] hover:border-[#93A664] transition-colors duration-200 group"
          >
            <FacebookIcon />
            <span className="ml-3 text-gray-700 font-medium text-sm group-hover:text-[#426128]">S'inscrire avec Facebook</span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>


        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Anarana (Prénom)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange('prenom', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none hover:border-[#93A664] text-sm ${
                  errors.prenom ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                  placeholder="Rakoto"
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
                Anarana raibe (Nom)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none hover:border-[#93A664] text-sm ${
                  errors.nom ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                  placeholder="Andry"
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
              Mailaka
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none hover:border-[#93A664] text-sm ${
                  errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="ny_mailakao@email.com"
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
              Vola
            </label>
            <CustomSelect
              value={formData.currency}
              onChange={(value) => handleInputChange('currency', value)}
              options={currencyOptions}
              placeholder="Choisir une devise"
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
              Teny miafina
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none hover:border-[#93A664] text-sm ${
                  errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              Hamarino ny teny miafina
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#93A664] focus:border-[#93A664] transition-all outline-none hover:border-[#93A664] text-sm ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
            {isSubmitting ? 'Miditra...' : 'Hisoratra anarana'}
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            Efa manana kaonty?{' '}
            <button 
              onClick={() => router.push('/connexion')}
              className="font-medium hover:underline"
              style={{ color: colors.secondary }}
            >
              Hiditra
            </button>
          </p>
        </div>
      </div>
    </div>
    </>
  )
}