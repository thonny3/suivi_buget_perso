"use client"
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingScreen from './LoadingScreen'


export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
 
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && status !== 'loading') {
      if (!user) {
        router.push('/connexion')
      }
    }
  }, [user, isLoading, status, router])

  if (isLoading || status === 'loading') {
    return <LoadingScreen />
  }

  if (!user) {
    return null // Ne rien afficher pendant la redirection
  }

  return children
}
