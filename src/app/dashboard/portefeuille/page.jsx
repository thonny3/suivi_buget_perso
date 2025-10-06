"use client"
import React, { useState, useEffect } from 'react'
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
  Users,
  Loader2
} from 'lucide-react'
import { colors } from '@/styles/colors'
import accountsService from '@/services/accountsService'
import { useToast } from '@/hooks/useToast'

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
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { showToast } = useToast();

  // Charger les comptes depuis l'API
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await accountsService.getMyAccounts();
      
      if (result.success) {
        // Formater les comptes pour l'affichage
        const formattedAccounts = result.data.map(account => accountsService.formatAccount(account));
        setAccounts(formattedAccounts);
      } else {
        setError(result.error);
        showToast(result.error, 'error');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des comptes:', err);
      setError(err.message);
      showToast('Erreur lors du chargement des comptes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Statistiques des comptes
  const stats = accountsService.calculateStats(accounts);
  const totalAccountBalance = stats.totalBalance;

  const handleAccountSave = async (accountData) => {
    try {
      let result;
      
      if (selectedItem) {
        // Mise à jour d'un compte existant
        result = await accountsService.updateAccount(selectedItem.id_compte, accountData);
        if (result.success) {
          showToast('Compte mis à jour avec succès', 'success');
        } else {
          showToast(result.error, 'error');
          return;
        }
      } else {
        // Création d'un nouveau compte
        result = await accountsService.createAccount(accountData);
        if (result.success) {
          showToast('Compte créé avec succès', 'success');
        } else {
          showToast(result.error, 'error');
          return;
        }
      }
      
      // Recharger les comptes
      await loadAccounts();
      setSelectedItem(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      showToast('Erreur lors de la sauvegarde du compte', 'error');
    }
  };

  const handleAccountEdit = (account) => {
    setSelectedItem(account);
    setIsAccountFormOpen(true);
  };

  const handleDelete = (account) => {
    setSelectedItem(account);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const result = await accountsService.deleteAccount(selectedItem.id_compte);
      
      if (result.success) {
        showToast('Compte supprimé avec succès', 'success');
        
        // Recharger les comptes
        await loadAccounts();
        setIsDeleteOpen(false);
        setSelectedItem(null);
      } else {
        showToast(result.error, 'error');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      showToast('Erreur lors de la suppression du compte', 'error');
    }
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
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.light }}>
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
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.secondary }}>
            <h3 className="text-sm font-medium opacity-80">Total des comptes</h3>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.primary }}>
            <h3 className="text-sm font-medium opacity-80">Solde total</h3>
            <p className="text-2xl font-bold mt-2">{totalAccountBalance.toFixed(2)}€</p>
          </div>
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.secondaryDark }}>
            <h3 className="text-sm font-medium opacity-80">Comptes partagés</h3>
            <p className="text-2xl font-bold mt-2">2</p>
          </div>
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.primaryDark }}>
            <h3 className="text-indigo-100 text-sm font-medium">Solde moyen</h3>
            <p className="text-2xl font-bold mt-2">
              {stats.averageBalance.toFixed(2)}€
            </p>
          </div>
        </div>

        {/* Liste des comptes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Vos comptes</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500 text-lg">Chargement des comptes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500 text-lg">{error}</p>
                <button 
                  onClick={loadAccounts}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : accounts.length === 0 ? (
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
                          <p className="text-sm text-gray-500 capitalize">{account.typeFormatted}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleShare(account)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Partager"
                        >
                          <Share2 className="w-4 h-4" />
                          <p>bojouhfb</p>
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
                      <p className="text-3xl font-bold text-gray-900">
                        {account.soldeFormatted || '0.00 €'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Solde actuel</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Accès partagé</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white">
                              <span className="text-emerald-600 text-xs font-medium">M</span>
                            </div>
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                              <span className="text-blue-600 text-xs font-medium">P</span>
                            </div>
                          </div>
                          <Users className="w-4 h-4 text-gray-400" />
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