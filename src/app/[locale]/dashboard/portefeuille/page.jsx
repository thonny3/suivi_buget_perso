"use client"
import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Share2,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react'
import { colors } from '@/styles/colors'

// Composant Modal de base
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Composant Formulaire Compte
const AccountForm = ({ isOpen, onClose, onSave, item = null }) => {
  const [formData, setFormData] = useState({
    nom: item?.nom || '',
    type: item?.type || 'courant',
    solde: item?.solde || ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom du compte est requis';
    if (!formData.solde || formData.solde < 0) newErrors.solde = 'Le solde doit être positif ou nul';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        ...formData,
        id_compte: item?.id_compte || Date.now(),
        solde: parseFloat(formData.solde),
      });
      onClose();
      setFormData({ nom: '', type: 'courant', solde: '' });
      setErrors({});
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifier le compte' : 'Créer un nouveau compte'}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du compte
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="Ex: Compte Épargne"
          />
          {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de compte
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="courant">Compte Courant</option>
            <option value="epargne">Épargne</option>
            <option value="investissement">Investissement</option>
            <option value="trading">Trading</option>
            <option value="crypto">Crypto</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solde initial (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.solde}
            onChange={(e) => handleChange('solde', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.solde ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="0.00"
          />
          {errors.solde && <p className="text-red-500 text-sm mt-1">{errors.solde}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              setFormData({ nom: '', type: 'courant', solde: '' });
              setErrors({});
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{item ? 'Mettre à jour' : 'Créer'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Composant Modal Partage de Compte
const ShareAccountModal = ({ isOpen, onClose, account }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('lecteur');
  const [sharedUsers, setSharedUsers] = useState([
    { id: 1, email: 'marie.durand@email.com', role: 'contributeur' },
    { id: 2, email: 'paul.martin@email.com', role: 'lecteur' }
  ]);

  const handleShare = () => {
    if (email && email.includes('@')) {
      setSharedUsers(prev => [...prev, {
        id: Date.now(),
        email,
        role
      }]);
      setEmail('');
      setRole('lecteur');
    }
  };

  const removeUser = (id) => {
    setSharedUsers(prev => prev.filter(user => user.id !== id));
  };

  const updateUserRole = (id, newRole) => {
    setSharedUsers(prev => prev.map(user => 
      user.id === id ? { ...user, role: newRole } : user
    ));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Partager le compte: ${account?.nom || 'Compte'}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Ajouter un utilisateur */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Inviter un utilisateur</h3>
          <div className="flex space-x-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="lecteur">Lecteur</option>
              <option value="contributeur">Contributeur</option>
              <option value="proprietaire">Propriétaire</option>
            </select>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inviter</span>
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Utilisateurs avec accès</h3>
          <div className="space-y-2">
            {sharedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-medium text-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      {user.role === 'proprietaire' && 'Propriétaire - Accès complet'}
                      {user.role === 'contributeur' && 'Contributeur - Peut modifier'}
                      {user.role === 'lecteur' && 'Lecteur - Lecture seule'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="text-sm px-2 py-1 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="lecteur">Lecteur</option>
                    <option value="contributeur">Contributeur</option>
                    <option value="proprietaire">Propriétaire</option>
                  </select>
                  <button
                    onClick={() => removeUser(user.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Niveaux d'accès</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Lecteur:</strong> Peut consulter le compte et les transactions</p>
            <p><strong>Contributeur:</strong> Peut ajouter/modifier des transactions</p>
            <p><strong>Propriétaire:</strong> Accès complet, peut gérer les partages</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Composant Modal de Confirmation de Suppression
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, item }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression" size="sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Supprimer ce compte ?
        </h3>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer le compte "{item?.nom}" ?<br />
          Cette action est irréversible.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Composant Principal
export default function GestionnaireComptes() {
  // États pour les comptes
  const [accounts, setAccounts] = useState([
    {
      id_compte: 1,
      nom: "Compte Principal",
      type: "courant",
      solde: 15420.50,
      isOwner: true,
      sharedWith: []
    },
    {
      id_compte: 2,
      nom: "Épargne Investissement",
      type: "epargne",
      solde: 28750.00,
      isOwner: true,
      sharedWith: []
    },
    {
      id_compte: 3,
      nom: "Compte Trading",
      type: "trading",
      solde: 12300.75,
      isOwner: true,
      sharedWith: []
    }
  ]);

  // Comptes partagés (dont l'utilisateur n'est pas propriétaire)
  const [sharedAccounts, setSharedAccounts] = useState([
    {
      id_compte: 4,
      nom: "Compte Familial",
      type: "courant",
      solde: 8500.00,
      isOwner: false,
      owner: "Marie Durand",
      role: "contributeur",
      sharedWith: []
    },
    {
      id_compte: 5,
      nom: "Projet Vacances",
      type: "epargne",
      solde: 3200.50,
      isOwner: false,
      owner: "Paul Martin",
      role: "lecteur",
      sharedWith: []
    }
  ]);

  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Statistiques des comptes
  const totalAccountBalance = accounts.reduce((sum, account) => sum + account.solde, 0);
  const totalSharedAccountBalance = sharedAccounts.reduce((sum, account) => sum + account.solde, 0);
  const totalAllAccountsBalance = totalAccountBalance + totalSharedAccountBalance;
  const totalSharedAccountsCount = sharedAccounts.length;

  const handleAccountSave = (accountData) => {
    if (selectedItem) {
      setAccounts(prev => prev.map(account =>
        account.id_compte === selectedItem.id_compte ? accountData : account
      ));
    } else {
      setAccounts(prev => [...prev, accountData]);
    }
    setSelectedItem(null);
  };

  const handleAccountEdit = (account) => {
    setSelectedItem(account);
    setIsAccountFormOpen(true);
  };

  const handleDelete = (account) => {
    setSelectedItem(account);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setAccounts(prev => prev.filter(account => account.id_compte !== selectedItem.id_compte));
    setIsDeleteOpen(false);
    setSelectedItem(null);
  };

  const handleShare = (account) => {
    setSelectedItem(account);
    setIsShareOpen(true);
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'courant': return <CreditCard className="w-5 h-5" />;
      case 'epargne': return <PiggyBank className="w-5 h-5" />;
      case 'investissement': return <TrendingUp className="w-5 h-5" />;
      case 'trading': return <TrendingUp className="w-5 h-5" />;
      case 'crypto': return <TrendingUp className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'courant': return 'bg-blue-100 text-blue-600';
      case 'epargne': return 'bg-green-100 text-green-600';
      case 'investissement': return 'bg-purple-100 text-purple-600';
      case 'trading': return 'bg-orange-100 text-orange-600';
      case 'crypto': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen p-6" >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Comptes</h1>
            <p className="text-gray-600 mt-1">Gérez vos comptes bancaires et financiers</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => {
                setSelectedItem(null);
                setIsAccountFormOpen(true);
              }}
              className="px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: colors.secondary }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondaryDark}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.secondary}
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau compte</span>
            </button>
          </div>
        </div>

        {/* Statistiques des comptes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Mes comptes</h3>
                <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <Wallet className="w-6 h-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Comptes partagés</h3>
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>{totalSharedAccountsCount}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <Users className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Solde total</h3>
                <p className="text-3xl font-bold" style={{ color: colors.secondary }}>{totalAllAccountsBalance.toFixed(2)}€</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <TrendingUp className="w-6 h-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Solde moyen</h3>
                <p className="text-3xl font-bold" style={{ color: colors.primaryDark }}>
                  {(accounts.length + totalSharedAccountsCount) > 0 ? (totalAllAccountsBalance / (accounts.length + totalSharedAccountsCount)).toFixed(2) : 0}€
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <PiggyBank className="w-6 h-6" style={{ color: colors.primaryDark }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mes comptes (propriétaires) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Mes comptes</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Wallet className="w-4 h-4" />
                <span>{accounts.length} compte{accounts.length > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun compte trouvé</p>
                <p className="text-sm text-gray-400 mt-1">Commencez par créer votre premier compte</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <div 
                    key={account.id_compte} 
                    className="rounded-xl border p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: colors.white, borderColor: colors.light }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${getTypeColor(account.type)}`}>
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{account.nom}</h3>
                          <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleShare(account)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Partager"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAccountEdit(account)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-3xl font-bold text-gray-900">{account.solde.toFixed(2)}€</p>
                      <p className="text-sm text-gray-500 mt-1">Solde actuel</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Propriétaire</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-emerald-600 text-xs font-medium">M</span>
                          </div>
                          <span className="text-emerald-600 text-xs font-medium">Vous</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comptes partagés */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Comptes partagés</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{totalSharedAccountsCount} compte{totalSharedAccountsCount > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            {totalSharedAccountsCount === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun compte partagé</p>
                <p className="text-sm text-gray-400 mt-1">Les comptes partagés avec vous apparaîtront ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedAccounts.map((account) => (
                  <div 
                    key={account.id_compte} 
                    className="rounded-xl border p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: colors.white, borderColor: colors.light }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${getTypeColor(account.type)}`}>
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{account.nom}</h3>
                          <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.role === 'proprietaire' ? 'bg-purple-100 text-purple-600' :
                          account.role === 'contributeur' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {account.role === 'proprietaire' ? 'Propriétaire' :
                           account.role === 'contributeur' ? 'Contributeur' : 'Lecteur'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-3xl font-bold text-gray-900">{account.solde.toFixed(2)}€</p>
                      <p className="text-sm text-gray-500 mt-1">Solde actuel</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Propriétaire</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-blue-600 text-xs font-medium">{account.owner.charAt(0)}</span>
                          </div>
                          <span className="text-blue-600 text-xs font-medium">{account.owner}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AccountForm
        isOpen={isAccountFormOpen}
        onClose={() => {
          setIsAccountFormOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleAccountSave}
        item={selectedItem}
      />

      <ShareAccountModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setSelectedItem(null);
        }}
        account={selectedItem}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={confirmDelete}
        item={selectedItem}
      />
    </div>
  );
}