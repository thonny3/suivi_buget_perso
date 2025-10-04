"use client"
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, locale }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      // Rediriger vers la connexion si non connecté
      router.push(`/${locale}/connexion`)
    }
  }, [isAuthenticated, isLoading, router, locale])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated()) {
    return null // Le useEffect va rediriger
  }

  return children
}