import React from 'react'

export default function LoadingScreen() {

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center z-50">
      <div className="text-center">

        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          TetiboPro
        </h1>

        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce delay-200"></div>
        </div>

        <p className="text-green-700 font-medium">Chargement en cours...</p>
      </div>
    </div>
  )
}
