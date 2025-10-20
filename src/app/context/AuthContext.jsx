"use client"
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiService from '@/services/apiService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Vérifier l'authentification au chargement de la page
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          // Vérifier si le token est encore valide
          const response = await apiService.verifyToken()
          setUser(response.user)
        }
      } catch (error) {
        console.error('Token invalide:', error)
        apiService.logout()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials)
      apiService.setToken(response.token)
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))
      return { success: true, user: response.user }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData)
      return { success: true, message: response.message }
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    apiService.logout()
    localStorage.removeItem('user')
    router.push('/')
  }

  const isAuthenticated = () => {
    return user !== null && apiService.isAuthenticated()
  }

  const getCurrentUser = async () => {
    const resp = await apiService.getCurrentUser()
    if (resp?.user) setUser(resp.user)
    return resp
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
