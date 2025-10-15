"use client"
import React from 'react'

export default function AlertesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Alertes</h1>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Mes alertes</h2>
        <p className="text-sm text-gray-600 mb-4">
          Configurez et consultez ici vos alertes budgétaires.
        </p>

        <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-500">
          Aucune alerte pour le moment.
        </div>
      </div>
    </div>
  )
}


