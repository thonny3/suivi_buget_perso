"use client"
import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  RefreshCw,
  Bell,
  BellOff,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Tv,
  Music,
  Smartphone,
  Cloud,
  Gamepad2,
  Car,
  Heart,
  Zap
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'

export default function AbonnementsPage() {
  const [abonnements, setAbonnements] = useState([
    {
      id_abonnement: 1,
      id_user: 1,
      nom: 'Netflix',
      montant: 15.99,
      frequence: 'Mensuel',
      prochaine_echeance: '2024-02-15',
      rappel: true,
      icone: 'Tv',
      couleur: '#EF4444',
      statut: 'Actuel',
      jours_restants: 8
    },
    {
      id_abonnement: 2,
      id_user: 1,
      nom: 'Spotify Premium',
      montant: 9.99,
      frequence: 'Mensuel',
      prochaine_echeance: '2024-02-20',
      rappel: true,
      icone: 'Music',
      couleur: '#10B981',
      statut: 'Actuel',
      jours_restants: 13
    },
    {
      id_abonnement: 3,
      id_user: 1,
      nom: 'Microsoft 365',
      montant: 99.00,
      frequence: 'Annuel',
      prochaine_echeance: '2024-12-01',
      rappel: false,
      icone: 'Cloud',
      couleur: '#3B82F6',
      statut: 'Actuel',
      jours_restants: 298
    },
    {
      id_abonnement: 4,
      id_user: 1,
      nom: 'PlayStation Plus',
      montant: 8.99,
      frequence: 'Mensuel',
      prochaine_echeance: '2024-02-10',
      rappel: true,
      icone: 'Gamepad2',
      couleur: '#8B5CF6',
      statut: 'Expire bientôt',
      jours_restants: 3
    },
    {
      id_abonnement: 5,
      id_user: 1,
      nom: 'Assurance Auto',
      montant: 450.00,
      frequence: 'Annuel',
      prochaine_echeance: '2024-01-30',
      rappel: true,
      icone: 'Car',
      couleur: '#F59E0B',
      statut: 'Expiré',
      jours_restants: -8
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAbonnement, setEditingAbonnement] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFrequence, setFilterFrequence] = useState('')
  const [filterStatut, setFilterStatut] = useState('')

  const [formData, setFormData] = useState({
    nom: '',
    montant: '',
    frequence: 'Mensuel',
    prochaine_echeance: '',
    rappel: true,
    icone: 'RefreshCw',
    couleur: '#3B82F6'
  })

  const iconOptions = [
    { name: 'RefreshCw', component: RefreshCw, label: 'Général' },
    { name: 'Tv', component: Tv, label: 'Streaming' },
    { name: 'Music', component: Music, label: 'Musique' },
    { name: 'Smartphone', component: Smartphone, label: 'Mobile' },
    { name: 'Cloud', component: Cloud, label: 'Cloud' },
    { name: 'Gamepad2', component: Gamepad2, label: 'Gaming' },
    { name: 'Car', component: Car, label: 'Automobile' },
    { name: 'Heart', component: Heart, label: 'Santé' },
    { name: 'Zap', component: Zap, label: 'Énergie' }
  ]

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'
  ]

  const frequenceOptions = ['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel']

  // Calculs automatiques
  const updateAbonnementsStatus = () => {
    const today = new Date()
    return abonnements.map(ab => {
      const echeance = new Date(ab.prochaine_echeance)
      const diffTime = echeance - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let statut = 'Actuel'
      if (diffDays < 0) {
        statut = 'Expiré'
      } else if (diffDays <= 7) {
        statut = 'Expire bientôt'
      }
      
      return {
        ...ab,
        jours_restants: diffDays,
        statut
      }
    })
  }

  useEffect(() => {
    setAbonnements(updateAbonnementsStatus())
  }, [])

  // Calculs statistiques
  const totalAbonnements = abonnements.length
  const abonnementsActifs = abonnements.filter(ab => ab.statut === 'Actuel').length
  const abonnementsExpires = abonnements.filter(ab => ab.statut === 'Expiré').length
  const abonnementsProches = abonnements.filter(ab => ab.statut === 'Expire bientôt').length
  const coutMensuelTotal = abonnements.reduce((sum, ab) => {
    if (ab.frequence === 'Mensuel') return sum + ab.montant
    if (ab.frequence === 'Trimestriel') return sum + (ab.montant / 3)
    if (ab.frequence === 'Semestriel') return sum + (ab.montant / 6)
    if (ab.frequence === 'Annuel') return sum + (ab.montant / 12)
    return sum
  }, 0)
  const coutAnnuelTotal = coutMensuelTotal * 12

  // Données pour les graphiques
  const repartitionData = [
    { name: 'Actifs', value: abonnementsActifs, color: '#10B981' },
    { name: 'Expire bientôt', value: abonnementsProches, color: '#F59E0B' },
    { name: 'Expirés', value: abonnementsExpires, color: '#EF4444' }
  ]

  const coutParFrequence = frequenceOptions.map(freq => ({
    frequence: freq,
    nombre: abonnements.filter(ab => ab.frequence === freq).length,
    cout: abonnements
      .filter(ab => ab.frequence === freq)
      .reduce((sum, ab) => sum + ab.montant, 0)
  }))

  const evolutionData = [
    { mois: 'Oct', cout: 45.97 },
    { mois: 'Nov', cout: 53.96 },
    { mois: 'Déc', cout: 53.96 },
    { mois: 'Jan', cout: coutMensuelTotal }
  ]

  // Filtrage des abonnements
  const filteredAbonnements = abonnements.filter(abonnement => {
    const matchesSearch = abonnement.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFrequence = !filterFrequence || abonnement.frequence === filterFrequence
    const matchesStatut = !filterStatut || abonnement.statut === filterStatut
    return matchesSearch && matchesFrequence && matchesStatut
  })

  const handleSubmit = () => {
    if (!formData.nom || !formData.montant || !formData.prochaine_echeance) {
      alert('Veuillez remplir tous les champs')
      return
    }

    const today = new Date()
    const echeance = new Date(formData.prochaine_echeance)
    const diffDays = Math.ceil((echeance - today) / (1000 * 60 * 60 * 24))
    
    let statut = 'Actuel'
    if (diffDays < 0) {
      statut = 'Expiré'
    } else if (diffDays <= 7) {
      statut = 'Expire bientôt'
    }

    if (editingAbonnement) {
      // Mise à jour
      setAbonnements(abonnements.map(ab =>
        ab.id_abonnement === editingAbonnement.id_abonnement
          ? {
              ...ab,
              ...formData,
              montant: parseFloat(formData.montant),
              jours_restants: diffDays,
              statut
            }
          : ab
      ))
    } else {
      // Création
      const newAbonnement = {
        id_abonnement: Math.max(...abonnements.map(a => a.id_abonnement)) + 1,
        id_user: 1,
        ...formData,
        montant: parseFloat(formData.montant),
        jours_restants: diffDays,
        statut
      }
      setAbonnements([...abonnements, newAbonnement])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      montant: '',
      frequence: 'Mensuel',
      prochaine_echeance: '',
      rappel: true,
      icone: 'RefreshCw',
      couleur: '#3B82F6'
    })
    setEditingAbonnement(null)
    setIsModalOpen(false)
  }

  const handleEdit = (abonnement) => {
    setEditingAbonnement(abonnement)
    setFormData({
      nom: abonnement.nom,
      montant: abonnement.montant.toString(),
      frequence: abonnement.frequence,
      prochaine_echeance: abonnement.prochaine_echeance,
      rappel: abonnement.rappel,
      icone: abonnement.icone,
      couleur: abonnement.couleur
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      setAbonnements(abonnements.filter(ab => ab.id_abonnement !== id))
    }
  }

  const toggleRappel = (id) => {
    setAbonnements(abonnements.map(ab =>
      ab.id_abonnement === id
        ? { ...ab, rappel: !ab.rappel }
        : ab
    ))
  }

  const getStatutStyle = (statut) => {
    switch (statut) {
      case 'Actuel':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle }
      case 'Expire bientôt':
        return { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle }
      case 'Expiré':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: Clock }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: RefreshCw }
    }
  }

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(option => option.name === iconName)
    return iconOption ? iconOption.component : RefreshCw
  }

  const getProchainPaiement = (frequence, dateActuelle) => {
    const date = new Date(dateActuelle)
    switch (frequence) {
      case 'Mensuel':
        date.setMonth(date.getMonth() + 1)
        break
      case 'Trimestriel':
        date.setMonth(date.getMonth() + 3)
        break
      case 'Semestriel':
        date.setMonth(date.getMonth() + 6)
        break
      case 'Annuel':
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Abonnements</h1>
            <p className="text-gray-600 mt-2">Gérez vos abonnements et évitez les oublis</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvel Abonnement
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalAbonnements}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{abonnementsActifs}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expire bientôt</p>
                <p className="text-2xl font-bold text-orange-600">{abonnementsProches}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coût Mensuel</p>
                <p className="text-2xl font-bold text-purple-600">{coutMensuelTotal.toFixed(2)}€</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coût Annuel</p>
                <p className="text-2xl font-bold text-pink-600">{coutAnnuelTotal.toFixed(0)}€</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Répartition des Statuts</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={repartitionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {repartitionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Abonnements']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Coût par Fréquence</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={coutParFrequence}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="frequence" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, 'Coût']} />
              <Bar dataKey="cout" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Évolution des Coûts</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}€`, 'Coût']} />
              <Line type="monotone" dataKey="cout" stroke="#EC4899" strokeWidth={3} />
            </LineChart>
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
                placeholder="Rechercher un abonnement..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filterFrequence}
            onChange={(e) => setFilterFrequence(e.target.value)}
          >
            <option value="">Toutes fréquences</option>
            {frequenceOptions.map(freq => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="Actuel">Actif</option>
            <option value="Expire bientôt">Expire bientôt</option>
            <option value="Expiré">Expiré</option>
          </select>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Liste des Abonnements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAbonnements.map((abonnement) => {
          const status = getStatutStyle(abonnement.statut)
          const StatusIcon = status.icon
          const IconComponent = getIconComponent(abonnement.icone)
          
          return (
            <div key={abonnement.id_abonnement} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${abonnement.couleur}20` }}
                  >
                    <IconComponent 
                      className="w-6 h-6" 
                      style={{ color: abonnement.couleur }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{abonnement.nom}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRappel(abonnement.id_abonnement)}
                    className={`p-2 rounded-lg transition-colors ${
                      abonnement.rappel 
                        ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                        : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                    }`}
                    title={abonnement.rappel ? 'Désactiver rappel' : 'Activer rappel'}
                  >
                    {abonnement.rappel ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(abonnement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(abonnement.id_abonnement)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informations */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Montant</span>
                  <span className="font-semibold text-lg">{abonnement.montant.toFixed(2)}€</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fréquence</span>
                  <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-full">
                    {abonnement.frequence}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prochaine échéance</span>
                  <span className="text-sm font-medium">
                    {new Date(abonnement.prochaine_echeance).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Temps restant</span>
                  <span className={`text-sm font-medium ${
                    abonnement.jours_restants < 0 ? 'text-red-600' :
                    abonnement.jours_restants <= 7 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {abonnement.jours_restants < 0 
                      ? `Expiré il y a ${Math.abs(abonnement.jours_restants)} jours`
                      : abonnement.jours_restants === 0 
                      ? "Aujourd'hui"
                      : `${abonnement.jours_restants} jours`
                    }
                  </span>
                </div>
              </div>

              {/* Statut */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${status.bg}`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-medium ${status.color}`}>
                  {abonnement.statut}
                </span>
              </div>

              {/* Actions rapides */}
              {abonnement.statut === 'Expiré' && (
                <button
                  onClick={() => {
                    const nouvelleEcheance = getProchainPaiement(abonnement.frequence, new Date().toISOString().split('T')[0])
                    setAbonnements(abonnements.map(ab =>
                      ab.id_abonnement === abonnement.id_abonnement
                        ? {
                            ...ab,
                            prochaine_echeance: nouvelleEcheance,
                            statut: 'Actuel',
                            jours_restants: Math.ceil((new Date(nouvelleEcheance) - new Date()) / (1000 * 60 * 60 * 24))
                          }
                        : ab
                    ))
                  }}
                  className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renouveler
                </button>
              )}
            </div>
          )
        })}
      </div>

      {filteredAbonnements.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun abonnement trouvé</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              {editingAbonnement ? 'Modifier l\'Abonnement' : 'Nouvel Abonnement'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'abonnement
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="Ex: Netflix, Spotify..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.montant}
                  onChange={(e) => setFormData({...formData, montant: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.frequence}
                  onChange={(e) => setFormData({...formData, frequence: e.target.value})}
                >
                  {frequenceOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prochaine échéance
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.prochaine_echeance}
                  onChange={(e) => setFormData({...formData, prochaine_echeance: e.target.value})}
                />
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    checked={formData.rappel}
                    onChange={(e) => setFormData({...formData, rappel: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Activer les rappels
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icône
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {iconOptions.map((option) => {
                    const IconComp = option.component
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setFormData({...formData, icone: option.name})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.icone === option.name 
                            ? 'border-purple-500 bg-purple-50' 
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
                <div className="flex gap-2 flex-wrap">
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  {editingAbonnement ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}