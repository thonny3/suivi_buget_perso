"use client"
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingScreen from './LoadingScreen'

export default function AdminProtectedRoute({ children, locale }) {
  const { isAuthenticated, isLoading, getCurrentUser } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Vérifier d'abord l'authentification
        if (!isAuthenticated()) {
          router.push(`/${locale}/connexion`)
          return
        }

        // Vérifier le rôle admin
        const currentUser = await getCurrentUser()
        const role = currentUser?.user?.role
        
        if (role !== 'admin') {
          // Rediriger vers le dashboard normal si pas admin
          router.push(`/${locale}/dashboard`)
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('Erreur lors de la vérification du rôle admin:', error)
        // En cas d'erreur, rediriger vers la connexion
        router.push(`/${locale}/connexion`)
      } finally {
        setCheckingRole(false)
      }
    }

    if (!isLoading) {
      checkAdminAccess()
    }
  }, [isAuthenticated, isLoading, getCurrentUser, router, locale])

  // Afficher le loading pendant la vérification
  if (isLoading || checkingRole) {
    return <LoadingScreen />
  }

  // Si pas authentifié ou pas admin, ne rien afficher (redirection en cours)
  if (!isAuthenticated() || !isAdmin) {
    return null
  }

  return children
}
