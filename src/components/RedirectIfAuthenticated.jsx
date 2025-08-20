"use client"
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  return children
}
