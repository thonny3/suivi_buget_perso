"use client"
import React, { useEffect, useState } from 'react'
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
import { comptesPartageIndex, createComptePartage, createComptes, deleteComptes, deleteComptesPartage, getComptes, modifiComptes, modifierRoleCromptePartage } from '../../../../services/compteService';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-toastify';

// Composant Modal de base
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay avec blur et semi-transparence */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Container modal */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 opacity-100`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content scrollable */}
        <div className="relative p-6 overflow-y-auto max-h-[calc(90vh-72px)] scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
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

  useEffect(() => {
    if (item) {
      setFormData({
        nom: item.nom || '',
        type: item.type || 'courant',
        solde: item.solde || ''
      });
    } else {
      setFormData({ nom: '', type: 'courant', solde: '' });
    }
  }, [item]);

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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const accountTypes = [
    { value: 'courant', label: 'Compte Courant', icon: '💳' },
    { value: 'epargne', label: 'Épargne', icon: '🏦' },
    { value: 'investissement', label: 'Investissement', icon: '📈' },
    { value: 'trading', label: 'Mobile', icon: '📱' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifier le compte' : 'Créer un compte'}
      size="md"
    >
      <div className="space-y-6">
        {/* Nom du compte */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Nom du compte</label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            className={`w-full px-3 py-2 text-gray-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.nom ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
            }`}
            placeholder="Ex: Mon Compte Épargne"
          />
          {errors.nom && <p className="text-red-500 text-xs">{errors.nom}</p>}
        </div>

        {/* Type de compte */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Type de compte</label>
          <div className="grid grid-cols-2 gap-2">
            {accountTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => handleChange('type', type.value)}
                className={`p-2 rounded-lg border text-sm flex items-center justify-center cursor-pointer transition ${
                  formData.type === type.value
                    ? 'bg-blue-50 border-blue-400'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </div>
            ))}
          </div>
        </div>

        {/* Solde */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Solde initial (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.solde}
            onChange={(e) => handleChange('solde', e.target.value)}
            className={`w-full px-3 py-2 text-gray-900 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.solde ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'
            }`}
            placeholder="0.00"
          />
          {errors.solde && <p className="text-red-500 text-xs">{errors.solde}</p>}
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              setFormData({ nom: '', type: 'courant', solde: '' });
              setErrors({});
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            {item ? 'Mettre à jour' : 'Créer'}
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
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(false); // Loading pour fetch
  const [sharing, setSharing] = useState(false); // Loading pour share

  const fetchPartageComptes = () => {
    if (!account?.id_compte) return;

    setLoading(true);
    comptesPartageIndex(account.id_compte)
      .then(res => setSharedUsers(res.data))
      .catch(err => toast.error("Impossible de charger les utilisateurs partagés"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPartageComptes();
  }, [account]);

  const handleShare = () => {
    if (!email) {
      toast.error("L'email est requis");
      return;
    }
    if (!email.includes('@')) {
      toast.error("Email invalide");
      return;
    }

    setSharing(true);
    console.log({ email, role, id_compte: account.id_compte });

    createComptePartage({ email, role, id_compte: account.id_compte })
      .then(res => {
        toast.success(res.data.message);
        setSharedUsers(prev => [
          ...prev,
          {
            id: Date.now(),
            email,
            role
          }
        ]);
      })
      .catch(err => {
        console.log(err);
        if (err.response) toast.error(err.response.data.message);
        else toast.error("Erreur réseau");
      })
      .finally(() => {
        setEmail('');
        setRole('lecteur');
        setSharing(false);
      });
  };

  const removeUser = (id) => {
    deleteComptesPartage(id).then(res => {
      toast.success(res.data.message);
      setSharedUsers(prev => prev.filter(user => user.id !== id));
    }).catch(errer => console.log(errer)
    )

  };

  const updateUserRole = (id, newRole) => {
    modifierRoleCromptePartage(id, { role: newRole }).then(res => {
      toast.success(res.data.message);

      setSharedUsers(prev => prev.map(user =>
        user.id === id ? { ...user, role: newRole } : user
      ));
    }).catch(err => {
      console.log(err);

    })

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
              disabled={sharing}
              className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2 ${sharing ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{sharing ? 'Patientez...' : 'Inviter'}</span>
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Utilisateurs avec accès</h3>
          {loading ? (
            <p className="text-gray-500">Chargement des utilisateurs...</p>
          ) : sharedUsers.length === 0 ? (
            <p className="text-gray-500">Aucun utilisateur n'a encore accès à ce compte</p>
          ) : (
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
          )}
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
  const [accounts, setAccounts] = useState([]);
  const { user } = useAuth()
  const fetchAllAccounts = async () => {
    try {
      const comptes = await getComptes();
      setAccounts(comptes);
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes :", error);
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);




  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Statistiques des comptes
  const totalAccountBalance = accounts.reduce(
    (sum, account) => sum + parseFloat(account.solde || 0),
    0
  );


  const handleAccountSave = (accountData) => {
    if (selectedItem) {

      modifiComptes(accountData, selectedItem.id_compte).then(res => {
        toast.success(res.data.message);
      }).catch(err => console.log("Erreur lors de la modification du compte :", err)
      )

      setAccounts(prev => prev.map(account =>
        account.id_compte === selectedItem.id_compte ? accountData : account
      ));

    } else {
      console.log("New account data:", accountData);
      createComptes(accountData).then(res => {
        toast.success(res.data.message);
      }).catch(err => console.log("Erreur lors de la création du compte :", err)
      )


      setAccounts(prev => [...prev, accountData]);
    }
    setSelectedItem(null);
  };

  const handleAccountEdit = (account) => {
    console.log("Editing account:", account);

    setSelectedItem(account);
    setIsAccountFormOpen(true);
  };

  const handleDelete = (account) => {
    setSelectedItem(account);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    deleteComptes(selectedItem.id_compte).then(res => {
      toast.success(res.data.message);
    }).catch(err => console.log("Erreur lors de la suppression du compte :", err)
    )
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau compte</span>
            </button>
          </div>
        </div>

       {/* Statistiques des comptes */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-full -mr-12 -mt-12"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-emerald-100 p-3 rounded-2xl">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">Total des comptes</h3>
      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
        {accounts.length}
      </p>
    </div>
  </div>

  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-full -mr-12 -mt-12"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-100 p-3 rounded-2xl">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">Solde total</h3>
      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
        {totalAccountBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {user.devise}
      </p>
    </div>
  </div>

  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-full -mr-12 -mt-12"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-purple-100 p-3 rounded-2xl">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">Comptes partagés</h3>
      <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
        2
      </p>
    </div>
  </div>

  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-full -mr-12 -mt-12"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-indigo-100 p-3 rounded-2xl">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-2">Solde moyen</h3>
      <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
        {accounts.length > 0
          ? (totalAccountBalance / accounts.length).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : '0,00'
        } {user.devise}
      </p>
    </div>
  </div>
</div>

       {/* Liste des comptes */}
<div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
  <div className="p-8">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Vos comptes
        </h2>
        <p className="text-gray-500 mt-1">Gérez tous vos comptes en un seul endroit</p>
      </div>
      <div className="hidden sm:flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">En temps réel</span>
      </div>
    </div>

    {accounts.length === 0 ? (
      <div className="text-center py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200/50">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun compte trouvé</h3>
            <p className="text-gray-500 mb-6">Commencez par créer votre premier compte pour suivre vos finances</p>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {accounts.map((account) => (
          <div
            key={account.id_compte}
            className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            {/* Élément décoratif de fond */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            {/* En-tête de la carte */}
            <div className="relative flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl ${getTypeColor(account.type)} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {getAccountTypeIcon(account.type)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl mb-1">{account.nom}</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                    {account.type}
                  </span>
                </div>
              </div>
              
              {/* Menu d'actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleShare(account)}
                  className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Partager"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleAccountEdit(account)}
                  className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(account)}
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Solde principal */}
            <div className="relative mb-6">
              <p className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                {Number(account.solde).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} {user.devise}
              </p>
              <p className="text-sm text-gray-500 font-medium">Solde actuel</p>
              
              {/* Indicateur de tendance */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            </div>

            {/* Section accès partagé */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-gray-100/50 rounded-xl"></div>
              <div className="relative p-4 rounded-xl border border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Accès partagé</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:bg-gray-300 transition-colors cursor-pointer">
                      <span className="text-gray-600 text-lg font-bold">+</span>
                    </div>
                  </div>
                </div>
                
                {/* Barre de progression décorative */}
                <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>

            {/* Indicateur d'activité */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <span className="text-xs text-gray-500 font-medium">Actif</span>
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