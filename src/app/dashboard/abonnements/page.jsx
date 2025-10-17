"use client"
import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
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
  Zap,
  Power,
  PowerOff
} from 'lucide-react'
import { colors } from '@/styles/colors'
import abonnementsService from '@/services/abonnementsService'
import { useAuth } from '@/app/context/AuthContext'
import accountsService from '@/services/accountsService'
 

export default function AbonnementsPage() {
  const { user } = useAuth()
  const [abonnements, setAbonnements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [renewedHistory, setRenewedHistory] = useState({})
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [renewTarget, setRenewTarget] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [comptes, setComptes] = useState([])
  const [loadingComptes, setLoadingComptes] = useState(false)
  const [selectedCompteId, setSelectedCompteId] = useState(null)
  const [selectedPeriods, setSelectedPeriods] = useState(1)

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
    couleur: '#3B82F6',
    id_compte: '',
    auto_renouvellement: false
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
    const load = async () => {
      if (!user?.id_user) return
      try {
        setLoading(true)
        setError('')
        // Charger l'historique de renouvellement (date ISO par abonnement)
        try {
          const rawHist = localStorage.getItem('abos-renewed-history')
          if (rawHist) setRenewedHistory(JSON.parse(rawHist))
        } catch (_e) {}
        const data = await abonnementsService.listByUser(user.id_user, { includeInactive: false })
        const normalized = Array.isArray(data) ? data.map(row => ({
          id_abonnement: row.id_abonnement,
          id_user: row.id_user,
          nom: row.nom,
          montant: Number(row.montant) || 0,
          frequence: row['fréquence'] || row.frequence || 'Mensuel',
          prochaine_echeance: row.prochaine_echeance,
          rappel: !!row.rappel,
          icone: row.icon || 'RefreshCw',
          couleur: row.couleur || '#3B82F6',
          id_compte: row.id_compte || null,
          auto_renouvellement: !!row.auto_renouvellement,
          date_dernier_renouvellement: row.date_dernier_renouvellement || null,
          actif: (row.actif == null ? 1 : Number(row.actif)) === 1
        })) : []
        setAbonnements(normalized.map(ab => ({...ab, ...computeStatus(ab)})))
        // Charger les comptes pour connaître les devises associées
        try {
          const res = await accountsService.getMyAccounts()
          if (res.success) setComptes(Array.isArray(res.data) ? res.data : [])
        } catch (_e) {}
      } catch (e) {
        setError(e?.message || 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id_user])

  const computeStatus = (ab) => {
    const today = new Date()
    const echeance = new Date(ab.prochaine_echeance)
    const diffTime = echeance - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    let statut = 'Actuel'
    if (diffDays < 0) statut = 'Expiré'
    else if (diffDays <= 7) statut = 'Expire bientôt'
    return { jours_restants: diffDays, statut }
  }

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

  const handleSubmit = async () => {
    if (!formData.nom || !formData.montant || !formData.prochaine_echeance) {
      alert('Veuillez remplir tous les champs')
      return
    }
    try {
      if (editingAbonnement) {
        await abonnementsService.update(editingAbonnement.id_abonnement, {
          nom: formData.nom,
          montant: parseFloat(formData.montant),
          frequence: formData.frequence,
          prochaine_echeance: formData.prochaine_echeance,
          rappel: formData.rappel ? 1 : 0,
          icon: formData.icone,
          couleur: formData.couleur,
          id_compte: formData.id_compte || null,
          auto_renouvellement: !!formData.auto_renouvellement
        })
      } else {
        await abonnementsService.create({
          id_user: user.id_user,
          nom: formData.nom,
          montant: parseFloat(formData.montant),
          frequence: formData.frequence,
          prochaine_echeance: formData.prochaine_echeance,
          rappel: formData.rappel ? 1 : 0,
          icon: formData.icone,
          couleur: formData.couleur,
          id_compte: formData.id_compte || null,
          auto_renouvellement: !!formData.auto_renouvellement
        })
      }
      const data = await abonnementsService.listByUser(user.id_user, { includeInactive: false })
      const normalized = Array.isArray(data) ? data.map(row => ({
        id_abonnement: row.id_abonnement,
        id_user: row.id_user,
        nom: row.nom,
        montant: Number(row.montant) || 0,
        frequence: row['fréquence'] || row.frequence || 'Mensuel',
        prochaine_echeance: row.prochaine_echeance,
        rappel: !!row.rappel,
        icone: row.icon || 'RefreshCw',
        couleur: row.couleur || '#3B82F6',
        id_compte: row.id_compte || null,
        auto_renouvellement: !!row.auto_renouvellement,
        actif: (row.actif == null ? 1 : Number(row.actif)) === 1
      })) : []
      setAbonnements(normalized.map(ab => ({...ab, ...computeStatus(ab)})))
      resetForm()
    } catch (e) {
      alert(e?.message || 'Erreur lors de l\'enregistrement')
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      montant: '',
      frequence: 'Mensuel',
      prochaine_echeance: '',
      rappel: true,
      icone: 'RefreshCw',
      couleur: '#3B82F6',
      id_compte: '',
      auto_renouvellement: false
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
      couleur: abonnement.couleur,
      id_compte: abonnement.id_compte || '',
      auto_renouvellement: !!abonnement.auto_renouvellement
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await abonnementsService.remove(id)
      setAbonnements(abonnements.filter(ab => ab.id_abonnement !== id))
    } catch (e) {
      alert(e?.message || 'Erreur lors de la suppression')
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

  const getCurrencySymbolForAbonnement = (abonnement) => {
    // 1) Si un compte est lié et connu, utiliser sa devise
    if (abonnement?.id_compte && Array.isArray(comptes) && comptes.length > 0) {
      const c = comptes.find(x => (x.id_compte || x.id) === abonnement.id_compte)
      const sym = c?.currencySymbol || resolveCurrencySymbol(c?.devise || c?.currency)
      if (sym) return sym
    }
    // 2) Essayer un champ devise/currency sur l'abonnement si existant
    const sym2 = resolveCurrencySymbol(abonnement?.devise || abonnement?.currency)
    if (sym2) return sym2
    // 3) Par défaut euro
    return '€'
  }

  const getCurrencyCodeForAbonnement = (abonnement) => {
    if (abonnement?.id_compte && Array.isArray(comptes) && comptes.length > 0) {
      const c = comptes.find(x => (x.id_compte || x.id) === abonnement.id_compte)
      return (c?.devise || c?.currency || '').toString().toUpperCase()
    }
    return (abonnement?.devise || abonnement?.currency || '').toString().toUpperCase()
  }

  const formatAmountForAbonnement = (abonnement) => {
    const code = getCurrencyCodeForAbonnement(abonnement)
    const symbol = getCurrencySymbolForAbonnement(abonnement)
    const decimals = (symbol === 'Ar' || code === 'MGA') ? 0 : 2
    const num = Number(abonnement.montant) || 0
    return `${num.toFixed(decimals)} ${symbol}`
  }

  const resolveCurrencySymbol = (deviseLike) => {
    const d = (deviseLike || '').toString().toUpperCase()
    if (!d) return ''
    if (d === 'MGA') return 'Ar'
    if (d === 'EUR') return '€'
    if (d === 'USD') return '$'
    if (d === 'GBP') return '£'
    return d
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
            className="text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            style={{ backgroundColor: colors.secondary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
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
                <p className="text-2xl font-bold text-purple-600">{coutMensuelTotal.toFixed(2)}</p>
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
                <p className="text-2xl font-bold text-pink-600">{coutAnnuelTotal.toFixed(0)}</p>
              </div>
              <div className="bg-pink-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques supprimés */}

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
            <div key={abonnement.id_abonnement} className={`rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow ${abonnement.actif ? 'bg-white border-gray-100' : 'bg-red-50 border-red-200'}`}>
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
                    onClick={async () => {
                      try {
                        const nextActif = !abonnement.actif
                        await abonnementsService.setActive(abonnement.id_abonnement, nextActif)
                        setAbonnements(prev => prev.map(x => x.id_abonnement === abonnement.id_abonnement ? { ...x, actif: nextActif } : x))
                      } catch (e) {
                        alert(e?.message || 'Erreur lors du changement de statut')
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors ${abonnement.actif ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-500 hover:bg-gray-100'}`}
                    title={abonnement.actif ? 'Désactiver' : 'Activer'}
                  >
                    {abonnement.actif ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => { setDeleteTarget(abonnement); setIsDeleteModalOpen(true) }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informations */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Montant</span>
                  <span className="font-semibold text-lg">{formatAmountForAbonnement(abonnement)}</span>
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
              <div className={`flex items-center justify-between gap-2 p-3 rounded-lg ${abonnement.actif ? status.bg : 'bg-red-100'}`}>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${abonnement.actif ? status.color : 'text-red-700'}`} />
                  <span className={`text-sm font-medium ${abonnement.actif ? status.color : 'text-red-700'}`}>
                    {abonnement.statut}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${abonnement.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-red-200 text-red-800'}`}>
                  {abonnement.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Actions rapides */}
              {!abonnement.actif ? (
                <div className="w-full mt-3 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Renouvellement désactivé (abonnement inactif)
                </div>
              ) : abonnement.auto_renouvellement ? (
                <div className="w-full mt-3 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Auto-renouvellement activé
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setRenewTarget(abonnement)
                      setIsRenewModalOpen(true)
                      setLoadingComptes(true)
                      setSelectedCompteId(abonnement.id_compte || null)
                      const res = await accountsService.getMyAccounts()
                      if (res.success) {
                        setComptes(Array.isArray(res.data) ? res.data : [])
                        if (!abonnement.id_compte && Array.isArray(res.data) && res.data.length > 0) {
                          setSelectedCompteId(res.data[0].id_compte || res.data[0].id)
                        }
                      } else {
                        alert(res.error || 'Impossible de charger les comptes')
                      }
                    } catch (e) {
                      alert(e?.message || 'Erreur lors du chargement des comptes')
                    } finally {
                      setLoadingComptes(false)
                    }
                  }}
                  className="w-full mt-3 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  <RefreshCw className="w-4 h-4" />
                  {abonnement.statut === 'Expiré' ? 'Renouveler' : 'Renouveler maintenant'}
                </button>
              )}

              {/* Badge de dernier renouvellement: backend si dispo, sinon historique local */}
              {(() => {
                const iso = abonnement.date_dernier_renouvellement || renewedHistory[abonnement.id_abonnement]
                if (!iso) return null
                const d = new Date(iso)
                const formatted = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                return (
                  <div className={`mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${abonnement.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    <CheckCircle className="w-3 h-3" /> Renouvelé le {formatted}
                  </div>
                )
              })()}
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

      {/* Modal de renouvellement: choix du compte */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Sélectionner le compte à débiter</h2>
            {renewTarget && (
              <div className="mb-4 text-sm text-gray-700">
                {(() => {
                  const selected = Array.isArray(comptes) ? comptes.find(c => (c.id_compte || c.id) === selectedCompteId) : null
                  const symbol = selected?.currencySymbol || resolveCurrencySymbol(selected?.devise || selected?.currency) || '€'
                  const amount = Number(renewTarget.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  return (
                    <>
                      Abonnement: <span className="font-medium">{renewTarget.nom}</span> • Montant: <span className="font-medium">{amount} {symbol}</span>
                    </>
                  )
                })()}
              </div>
            )}
            {loadingComptes ? (
              <div className="text-gray-500">Chargement des comptes...</div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(comptes) && comptes.length > 0 ? (
                  comptes.map((c) => (
                    <label key={c.id_compte || c.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="compte"
                          checked={selectedCompteId === (c.id_compte || c.id)}
                          onChange={() => setSelectedCompteId(c.id_compte || c.id)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{c.nom || c.name || `Compte ${c.id_compte || c.id}`}</div>
                          <div className="text-xs text-gray-500">Solde: {(parseFloat(c.solde) || 0).toFixed(2)}• {c.type || ''}</div>
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Aucun compte disponible. Créez un compte d'abord.</div>
                )}
              </div>
            )}

            {/* Nombre de périodes à renouveler */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de périodes à renouveler
              </label>
              <input
                type="number"
                min={1}
                max={24}
                value={selectedPeriods}
                onChange={(e) => setSelectedPeriods(Math.max(1, Math.min(24, parseInt(e.target.value || '1', 10))))}
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Une période = selon la fréquence (Mensuel = 1 mois, Trimestriel = 1 trimestre, ...)
              </div>
            </div>

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={() => { setIsRenewModalOpen(false); setRenewTarget(null) }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!selectedCompteId}
                onClick={async () => {
                  if (!renewTarget || !selectedCompteId) return
                  try {
                    let lastProchaine = null
                    for (let i = 0; i < (selectedPeriods || 1); i++) {
                      const res = await abonnementsService.renew({ id_abonnement: renewTarget.id_abonnement, id_compte: selectedCompteId })
                      if (res && res.prochaine_echeance) {
                        lastProchaine = res.prochaine_echeance
                      }
                    }
                    // Enregistrer la vraie date de renouvellement (aujourd'hui)
                    setRenewedHistory(prev => {
                      const next = { ...prev, [renewTarget.id_abonnement]: new Date().toISOString() }
                      try { localStorage.setItem('abos-renewed-history', JSON.stringify(next)) } catch (_e) {}
                      return next
                    })
                    const data = await abonnementsService.listByUser(user.id_user, { includeInactive: true })
                    const normalized = Array.isArray(data) ? data.map(row => ({
                      id_abonnement: row.id_abonnement,
                      id_user: row.id_user,
                      nom: row.nom,
                      montant: Number(row.montant) || 0,
                      frequence: row['fréquence'] || row.frequence || 'Mensuel',
                      prochaine_echeance: row.prochaine_echeance,
                      rappel: !!row.rappel,
                      icone: row.icon || 'RefreshCw',
                      couleur: row.couleur || '#3B82F6'
                    })) : []
                    setAbonnements(normalized.map(ab => ({...ab, ...computeStatus(ab)})))
                    setIsRenewModalOpen(false)
                    setRenewTarget(null)
                    setSelectedPeriods(1)
                  } catch (e) {
                    alert(e?.message || 'Erreur lors du renouvellement')
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200 ${!selectedCompteId ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: colors.secondary }}
                onMouseEnter={(e) => { if (selectedCompteId) e.target.style.backgroundColor = colors.secondaryDark }}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
              >
                Confirmer le renouvellement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
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
                  Montant 
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

              {/* Compte lié pour le prélèvement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compte à débiter (optionnel)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.id_compte}
                  onChange={(e) => setFormData({ ...formData, id_compte: e.target.value })}
                  onFocus={async () => {
                    if (!Array.isArray(comptes) || comptes.length === 0) {
                      try {
                        setLoadingComptes(true)
                        const res = await accountsService.getMyAccounts()
                        if (res.success) setComptes(Array.isArray(res.data) ? res.data : [])
                      } catch (_e) {
                        // noop
                      } finally {
                        setLoadingComptes(false)
                      }
                    }
                  }}
                >
                  <option value="">-- Sélectionner un compte --</option>
                  {Array.isArray(comptes) && comptes.map(c => (
                    <option key={c.id_compte || c.id} value={c.id_compte || c.id}>
                      {(c.nom || c.name || `Compte ${c.id_compte || c.id}`)}
                    </option>
                  ))}
                </select>
                {loadingComptes && (
                  <div className="text-xs text-gray-500 mt-1">Chargement des comptes...</div>
                )}
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

              {/* Auto-renouvellement */}
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    checked={!!formData.auto_renouvellement}
                    onChange={(e) => setFormData({ ...formData, auto_renouvellement: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Activer l'auto-renouvellement automatique à l'échéance
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Si activé, le système renouvellera automatiquement en débitant le compte choisi lorsque la date d'échéance arrive.
                </p>
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
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  style={{ backgroundColor: colors.secondary }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
                  onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
                >
                  {editingAbonnement ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* (Modal de test email retirée) */}
      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mt-2">
              Voulez-vous vraiment supprimer l'abonnement
              {' '}<span className="font-medium">{deleteTarget.nom}</span> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null) }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deleteTarget.id_abonnement
                  await handleDelete(id)
                  setIsDeleteModalOpen(false)
                  setDeleteTarget(null)
                }}
                className="flex-1 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                style={{ backgroundColor: '#ef4444' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}