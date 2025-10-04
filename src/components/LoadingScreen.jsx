import React from 'react'
import { colors } from '@/styles/colors'

export default function LoadingScreen() {

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: colors.light }}>
      <div className="text-center">

        <h1 className="text-4xl font-bold mb-6" style={{ color: colors.secondary }}>
          MyJalako
        </h1>

        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: colors.light }}></div>
          <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin" style={{ borderTopColor: colors.secondary }}></div>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.secondary }}></div>
          <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: colors.primary }}></div>
          <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: colors.secondary }}></div>
        </div>

        <p className="font-medium" style={{ color: colors.secondary }}>Chargement en cours...</p>
      </div>
    </div>
  )
}
