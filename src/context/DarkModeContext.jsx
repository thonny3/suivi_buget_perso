"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'

const DarkModeContext = createContext()

export const useDarkMode = () => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Charger le mode sombre depuis localStorage au montage
  useEffect(() => {
    setMounted(true)
    try {
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode !== null) {
        setIsDarkMode(savedDarkMode === 'true')
      } else {
        // Vérifier la préférence système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(prefersDark)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du mode sombre:', error)
    }
  }, [])

  // Appliquer le mode sombre au document
  useEffect(() => {
    if (!mounted) return
    
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('darkMode', 'true')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('darkMode', 'false')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mode sombre:', error)
    }
  }, [isDarkMode, mounted])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const value = {
    isDarkMode,
    toggleDarkMode,
    mounted
  }

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  )
}

