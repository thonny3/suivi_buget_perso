"use client"
import LoadingScreen from '@/components/LoadingScreen'
import { useAuth } from '@/app/context/AuthContext'
import { ArrowLeft, Lock, LogIn, User, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
//import { toast } from "react-toastify";

import { signIn } from 'next-auth/react'
import { loginUser } from '../../../services/authServices'


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

export default function ConnexionPage() {
  const { login, isAuthenticated } = useAuth()

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Loading effet au montage du composant
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Réduit de 2s à 1.5s

    return () => clearTimeout(timer)
  }, [])

  // Rediriger si déjà connecté (local ou Google)
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

    // Validation email
    if (!formData.email) {
      newErrors.email = 'Ny mailaka dia ilaina'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ny mailaka dia tsy marina'
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Ny teny miafina dia ilaina'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Ny teny miafina dia tokony ho 6 na mihoatra'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Fonction pour traduire les messages d'erreur de l'API en malgache
  const getErrorMessage = (apiMessage) => {
    const errorMessages = {
      'Utilisateur non trouvé': 'Ny mailaka dia tsy hita',
      'Mot de passe incorrect': 'Ny teny miafina dia diso',
      'Email not found': 'Ny mailaka dia tsy hita',
      'Invalid password': 'Ny teny miafina dia diso',
      'User not found': 'Ny mailaka dia tsy hita',
      'Wrong password': 'Ny teny miafina dia diso',
      'Invalid credentials': 'Ny angona dia tsy marina'
    }

    return errorMessages[apiMessage] || 'Nisy olana tamin\'ny fidirana'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Effacer les erreurs précédentes
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // simulate API delay

    try {
      const data = await loginUser(formData);
      console.log("✅ Connexion réussie :", data);
      login(data); // Appel de la fonction de connexion du contexte
    } catch (err) {
      if (err.response && err.response.data) {
        console.error("❌ Erreur API :", err.response.data.message);

        const apiMessage = err.response.data.message;

        // Identifier le type d'erreur et l'assigner au bon champ
        if (apiMessage.includes('Utilisateur non trouvé') ||
          apiMessage.includes('User not found') ||
          apiMessage.includes('Email not found')) {
          setErrors({ email: getErrorMessage(apiMessage) });
        } else if (apiMessage.includes('Mot de passe incorrect') ||
          apiMessage.includes('Invalid password') ||
          apiMessage.includes('Wrong password')) {
          setErrors({ password: getErrorMessage(apiMessage) });
        } else {
          // Erreur générale
          setErrors({
            email: '',
            password: '',
            general: getErrorMessage(apiMessage)
          });
        }
      } else {
        console.error("❌ Erreur inattendue :", err.message);
        setErrors({
          general: 'Nisy olana tsy nampoizina. Andramo indray azafady.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' })
    // Ici, vous pouvez ajouter une logique supplémentaire si nécessaire
    // Par exemple, enregistrer l'utilisateur dans votre base de données
    // ou gérer les erreurs de connexion.
    console.log('Google login')
  }

  const handleFacebookLogin = () => {
    console.log('Facebook login')
  }

  const handleSignupRedirect = () => {
    router.push('/register')
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  // Si déjà connecté, ne pas afficher le formulaire
  if (isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
        <button
          onClick={returnHome}
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </button>

        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <LogIn className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">TetiboPro</h1>
          <p className="text-gray-600 mt-1 text-sm">Midira amin'ny kaontinao</p>
        </div>

        <div className="space-y-2 mb-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
          >
            <GoogleIcon />
            <span className="ml-3 text-gray-700 font-medium text-sm">Se connecter avec Google</span>
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
          >
            <FacebookIcon />
            <span className="ml-3 text-gray-700 font-medium text-sm">Se connecter avec Facebook</span>
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Affichage des erreurs générales */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {errors.general}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mailaka
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-sm ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
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
                Teny miafina
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none text-sm ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <div className="flex items-center mt-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button className="text-green-600 hover:underline text-xs font-medium">
                Hadino ny teny miafina?
              </button>
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Miditra...' : 'Hiditra'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            Mbola tsy manana kaonty?{' '}
            <button
              onClick={handleSignupRedirect}
              className="text-green-600 hover:underline font-medium"
            >
              Hisoratra anarana
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}