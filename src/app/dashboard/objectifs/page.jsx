"use client"
import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trophy,
  Zap,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Smartphone
} from 'lucide-react'
import { colors } from '@/styles/colors'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

export default function ObjectifsPage() {
  const [objectifs, setObjectifs] = useState([
    {
      id_objectif: 1,
      id_user: 1,
      nom: 'Achat Voiture',
      montant_objectif: 25000.00,
      date_limite: '2024-12-31',
      montant_actuel: 18500.00,
      pourcentage: 74,
      statut: 'En cours',
      icone: 'Car',
      couleur: '#3B82F6'
    },
    {
      id_objectif: 2,
      id_user: 1,
      nom: 'Voyage au Japon',
      montant_objectif: 8000.00,
      date_limite: '2024-08-15',
      montant_actuel: 8000.00,
      pourcentage: 100,
      statut: 'Atteint',
      icone: 'Plane',
      couleur: '#10B981'
    },
    {
      id_objectif: 3,
      id_user: 1,
      nom: 'Apport Maison',
      montant_objectif: 50000.00,
      date_limite: '2025-06-30',
      montant_actuel: 12000.00,
      pourcentage: 24,
      statut: 'En cours',
      icone: 'Home',
      couleur: '#F59E0B'
    },
    {
      id_objectif: 4,
      id_user: 1,
      nom: 'Formation Tech',
      montant_objectif: 3500.00,
      date_limite: '2024-03-15',
      montant_actuel: 1200.00,
      pourcentage: 34,
      statut: 'Retard',
      icone: 'GraduationCap',
      couleur: '#EF4444'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingObjectif, setEditingObjectif] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isAddingMoney, setIsAddingMoney] = useState(false)
  const [addMoneyAmount, setAddMoneyAmount] = useState('')
  const [selectedObjectifForMoney, setSelectedObjectifForMoney] = useState(null)

  const [formData, setFormData] = useState({
    nom: '',
    montant_objectif: '',
    date_limite: '',
    icone: 'Target',
    couleur: '#3B82F6'
  })

  const iconOptions = [
    { name: 'Target', component: Target, label: 'Objectif général' },
    { name: 'Car', component: Car, label: 'Voiture' },
    { name: 'Home', component: Home, label: 'Maison' },
    { name: 'Plane', component: Plane, label: 'Voyage' },
    { name: 'GraduationCap', component: GraduationCap, label: 'Formation' },
    { name: 'Heart', component: Heart, label: 'Santé' },
    { name: 'Smartphone', component: Smartphone, label: 'Technologie' },
    { name: 'Trophy', component: Trophy, label: 'Récompense' }
  ]

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ]

  // Calculs statistiques
  const totalObjectifs = objectifs.length
  const objectifsAtteints = objectifs.filter(obj => obj.statut === 'Atteint').length
  const objectifsEnCours = objectifs.filter(obj => obj.statut === 'En cours').length
  const objectifsRetard = objectifs.filter(obj => obj.statut === 'Retard').length
  const montantTotalObjectifs = objectifs.reduce((sum, obj) => sum + obj.montant_objectif, 0)
  const montantTotalActuel = objectifs.reduce((sum, obj) => sum + obj.montant_actuel, 0)
  const progressionGlobale = montantTotalObjectifs > 0 ? Math.round((montantTotalActuel / montantTotalObjectifs) * 100) : 0

  // Données pour les graphiques
  const progressionData = objectifs.map(obj => ({
    nom: obj.nom.substring(0, 10) + '...',
    objectif: obj.montant_objectif,
    actuel: obj.montant_actuel,
    pourcentage: obj.pourcentage
  }))

  const statutsData = [
    { name: 'Atteints', value: objectifsAtteints, color: '#10B981' },
    { name: 'En cours', value: objectifsEnCours, color: '#3B82F6' },
    { name: 'En retard', value: objectifsRetard, color: '#EF4444' }
  ]

  // Filtrage des objectifs
  const filteredObjectifs = objectifs.filter(objectif => {
    const matchesSearch = objectif.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || objectif.statut === filterStatus
    return matchesSearch && matchesStatus
  })

  const updateObjectifStatus = (objectif) => {
    const today = new Date()
    const dateLimit = new Date(objectif.date_limite)
    
    if (objectif.pourcentage >= 100) {
      return 'Atteint'
    } else if (today > dateLimit) {
      return 'Retard'
    } else {
      return 'En cours'
    }
  }

  const handleSubmit = () => {
    if (!formData.nom || !formData.montant_objectif || !formData.date_limite) {
      alert('Veuillez remplir tous les champs')
      return
    }

    if (editingObjectif) {
      // Mise à jour
      setObjectifs(objectifs.map(obj =>
        obj.id_objectif === editingObjectif.id_objectif
          ? {
              ...obj,
              ...formData,
              montant_objectif: parseFloat(formData.montant_objectif),
              pourcentage: Math.round((obj.montant_actuel / parseFloat(formData.montant_objectif)) * 100),
              statut: updateObjectifStatus({
                ...obj,
                montant_objectif: parseFloat(formData.montant_objectif),
                date_limite: formData.date_limite
              })
            }
          : obj
      ))
    } else {
      // Création
      const newObjectif = {
        id_objectif: Math.max(...objectifs.map(o => o.id_objectif)) + 1,
        id_user: 1,
        ...formData,
        montant_objectif: parseFloat(formData.montant_objectif),
        montant_actuel: 0,
        pourcentage: 0,
        statut: 'En cours'
      }
      setObjectifs([...objectifs, newObjectif])
    }
    
    resetForm()
  }

  const handleAddMoney = () => {
    if (!addMoneyAmount || !selectedObjectifForMoney) {
      alert('Veuillez saisir un montant')
      return
    }

    const montant = parseFloat(addMoneyAmount)
    setObjectifs(objectifs.map(obj =>
      obj.id_objectif === selectedObjectifForMoney.id_objectif
        ? {
            ...obj,
            montant_actuel: obj.montant_actuel + montant,
            pourcentage: Math.round(((obj.montant_actuel + montant) / obj.montant_objectif) * 100),
            statut: updateObjectifStatus({
              ...obj,
              montant_actuel: obj.montant_actuel + montant,
              pourcentage: Math.round(((obj.montant_actuel + montant) / obj.montant_objectif) * 100)
            })
          }
        : obj
    ))

    setAddMoneyAmount('')
    setSelectedObjectifForMoney(null)
    setIsAddingMoney(false)
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      montant_objectif: '',
      date_limite: '',
      icone: 'Target',
      couleur: '#3B82F6'
    })
    setEditingObjectif(null)
    setIsModalOpen(false)
  }

  const handleEdit = (objectif) => {
    setEditingObjectif(objectif)
    setFormData({
      nom: objectif.nom,
      montant_objectif: objectif.montant_objectif.toString(),
      date_limite: objectif.date_limite,
      icone: objectif.icone,
      couleur: objectif.couleur
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      setObjectifs(objectifs.filter(obj => obj.id_objectif !== id))
    }
  }

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'Atteint':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' }
      case 'En cours':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'Retard':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' }
      default:
        return { icon: Target, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const getProgressColor = (pourcentage) => {
    if (pourcentage >= 100) return 'bg-green-500'
    if (pourcentage >= 75) return 'bg-blue-500'
    if (pourcentage >= 50) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getDaysRemaining = (dateLimit) => {
    const today = new Date()
    const limit = new Date(dateLimit)
    const diffTime = limit - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(option => option.name === iconName)
    return iconOption ? iconOption.component : Target
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Objectifs</h1>
            <p className="text-gray-600 mt-2">Définissez et suivez vos objectifs financiers</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
          >
            <Plus className="w-5 h-5" />
            Nouvel Objectif
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Objectifs</p>
                <p className="text-2xl font-bold text-gray-900">{totalObjectifs}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atteints</p>
                <p className="text-2xl font-bold text-green-600">{objectifsAtteints}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progression</p>
                <p className="text-2xl font-bold text-purple-600">{progressionGlobale}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant Total</p>
                <p className="text-2xl font-bold text-gray-900">{montantTotalObjectifs.toLocaleString()}€</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Progression par Objectif</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nom" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, '']} />
              <Legend />
              <Bar dataKey="objectif" fill="#E5E7EB" name="Objectif" />
              <Bar dataKey="actuel" fill="#10B981" name="Actuel" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Répartition des Statuts</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statutsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statutsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Objectifs']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un objectif..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="En cours">En cours</option>
            <option value="Atteint">Atteints</option>
            <option value="Retard">En retard</option>
          </select>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Liste des Objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredObjectifs.map((objectif) => {
          const status = getStatusIcon(objectif.statut)
          const StatusIcon = status.icon
          const IconComponent = getIconComponent(objectif.icone)
          const daysRemaining = getDaysRemaining(objectif.date_limite)
          
          return (
            <div key={objectif.id_objectif} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${objectif.couleur}20` }}
                  >
                    <IconComponent 
                      className="w-6 h-6" 
                      style={{ color: objectif.couleur }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{objectif.nom}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(objectif)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(objectif.id_objectif)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progression */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progression</span>
                  <span className="text-sm font-medium">{objectif.pourcentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(objectif.pourcentage)}`}
                    style={{ width: `${Math.min(objectif.pourcentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Montants */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actuel</span>
                  <span className="font-medium">{objectif.montant_actuel.toLocaleString()}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Objectif</span>
                  <span className="font-medium">{objectif.montant_objectif.toLocaleString()}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Restant</span>
                  <span className="font-medium text-orange-600">
                    {(objectif.montant_objectif - objectif.montant_actuel).toLocaleString()}€
                  </span>
                </div>
              </div>

              {/* Date limite */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Échéance: {new Date(objectif.date_limite).toLocaleDateString('fr-FR')}</span>
                {daysRemaining > 0 && (
                  <span className="text-blue-600">({daysRemaining} jours)</span>
                )}
                {daysRemaining <= 0 && objectif.statut !== 'Atteint' && (
                  <span className="text-red-600">(Expiré)</span>
                )}
              </div>

              {/* Statut */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${status.bg} mb-4`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>
                  {objectif.statut}
                </span>
              </div>

              {/* Action d'ajout d'argent */}
              {objectif.statut !== 'Atteint' && (
                <button
                  onClick={() => {
                    setSelectedObjectifForMoney(objectif)
                    setIsAddingMoney(true)
                  }}
                  className="w-full text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  <Plus className="w-4 h-4" />
                  Ajouter de l'argent
                </button>
              )}
            </div>
          )
        })}
      </div>

      {filteredObjectifs.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun objectif trouvé</p>
        </div>
      )}

      {/* Modal Création/Modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              {editingObjectif ? 'Modifier l\'Objectif' : 'Nouvel Objectif'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'objectif
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="Ex: Achat voiture, Voyage..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant objectif (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.montant_objectif}
                  onChange={(e) => setFormData({...formData, montant_objectif: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date limite
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.date_limite}
                  onChange={(e) => setFormData({...formData, date_limite: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {iconOptions.map((option) => {
                    const IconComp = option.component
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setFormData({...formData, icone: option.name})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.icone === option.name 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <IconComp className="w-5 h-5 mx-auto" />
                        <span className="text-xs mt-1 block">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur
                </label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, couleur: color})}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.couleur === color 
                          ? 'border-gray-400 scale-110' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {editingObjectif ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout d'argent */}
      {isAddingMoney && selectedObjectifForMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              Ajouter de l'argent
            </h2>
            <p className="text-gray-600 mb-4">
              Objectif: <span className="font-medium">{selectedObjectifForMoney.nom}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à ajouter (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Montant actuel:</span>
                  <span className="font-medium">{selectedObjectifForMoney.montant_actuel.toLocaleString()}€</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Après ajout:</span>
                  <span className="font-medium text-green-600">
                    {(selectedObjectifForMoney.montant_actuel + (parseFloat(addMoneyAmount) || 0)).toLocaleString()}€
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Progression:</span>
                  <span className="font-medium">
                    {Math.round(((selectedObjectifForMoney.montant_actuel + (parseFloat(addMoneyAmount) || 0)) / selectedObjectifForMoney.montant_objectif) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMoney(false)
                    setSelectedObjectifForMoney(null)
                    setAddMoneyAmount('')
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddMoney}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}