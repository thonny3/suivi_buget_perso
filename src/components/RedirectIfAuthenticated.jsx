"use client"
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

export default function RedirectIfAuthenticated({ children, locale }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated()) {
      // Rediriger vers le dashboard si déjà connecté
      router.push(`/${locale}/dashboard`)
    }
  }, [isAuthenticated, isLoading, router, locale])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated()) {
    return null // Le useEffect va rediriger
  }

  return children
}