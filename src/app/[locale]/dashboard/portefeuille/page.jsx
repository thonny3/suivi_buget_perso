"use client"
import { API_CONFIG } from '@/config/api'
import React, { useState, useEffect, useRef } from 'react'
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
  Loader2,
  Landmark,
  Coins,
  Smartphone,
  Banknote,
  BarChart3,
  Activity
} from 'lucide-react'
import { colors } from '@/styles/colors'
import accountsService from '@/services/accountsService'
import sharedAccountsService from '@/services/sharedAccountsService'
import apiService from '@/services/apiService'
import { useToast } from '@/hooks/useToast'
import { useLanguage } from '@/context/LanguageContext'

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
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto custom-scrollbar scroll-smooth`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
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
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nom: '',
    type: 'courant',
    solde: ''
  });

  const [errors, setErrors] = useState({});

  // Fonction pour obtenir l'icône du type de compte
  const getAccountTypeIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type?.toLowerCase()) {
      case 'courant':
        return <Landmark className={iconClass} />;
      case 'epargne':
        return <PiggyBank className={iconClass} />;
      case 'investissement':
        return <TrendingUp className={iconClass} />;
      case 'trading':
        return <BarChart3 className={iconClass} />;
      case 'crypto':
        return <Coins className={iconClass} />;
      case 'mobile_money':
      case 'mobile money':
        return <Smartphone className={iconClass} />;
      case 'cash':
      case 'espèces':
        return <Banknote className={iconClass} />;
      default:
        return <Wallet className={iconClass} />;
    }
  };

  // Fonction pour obtenir la couleur du type de compte
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'courant':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
      case 'epargne':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
      case 'investissement':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300';
      case 'trading':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300';
      case 'crypto':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300';
      case 'mobile_money':
      case 'mobile money':
        return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300';
      case 'cash':
      case 'espèces':
        return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  // Mettre à jour le formulaire quand l'item change
  useEffect(() => {
    if (item) {
      setFormData({
        nom: item.nom || '',
        type: item.type || 'courant',
        solde: item.solde || ''
      });
    } else {
      setFormData({
        nom: '',
        type: 'courant',
        solde: ''
      });
    }
    setErrors({});
  }, [item]);

  // Réinitialiser les champs quand le modal se ferme après un enregistrement réussi
  useEffect(() => {
    if (!isOpen && !item) {
      // Réinitialiser les champs quand le modal est fermé et qu'il n'y a pas d'item (mode création)
      setFormData({
        nom: '',
        type: 'courant',
        solde: ''
      });
      setErrors({});
    }
  }, [isOpen, item]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = t('portefeuille.errors.nameRequired');
    if (!formData.solde || formData.solde < 0) newErrors.solde = t('portefeuille.errors.balanceRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Réinitialiser les champs avant la soumission si c'est une création
      const accountData = {
        ...formData,
        id_compte: item?.id_compte || Date.now(),
        solde: parseFloat(formData.solde),
      };
      
      await onSave(accountData);
      
      // Réinitialiser les champs après la soumission réussie
      if (!item) {
        // Si c'est une création, réinitialiser les champs
        setFormData({
          nom: '',
          type: 'courant',
          solde: ''
        });
        setErrors({});
      }
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
      title={item ? t('portefeuille.editAccount') : t('portefeuille.newAccount')}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('portefeuille.accountName')}
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.nom ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            placeholder={t('portefeuille.accountNamePlaceholder')}
          />
          {errors.nom && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.nom}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('portefeuille.accountType')}
          </label>
          <div className="relative">
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer"
          >
            {accountsService.getAvailableTypes().map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <div className={`p-1.5 rounded ${getTypeColor(formData.type)}`}>
                {getAccountTypeIcon(formData.type)}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('portefeuille.initialBalance')}
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.solde}
            onChange={(e) => handleChange('solde', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.solde ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            placeholder="0.00"
          />
          {errors.solde && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.solde}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{item ? t('portefeuille.update') : t('portefeuille.create')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Composant Modal Partage de Compte
const ShareAccountModal = ({ isOpen, onClose, account, onShareSuccess }) => {
  const { t } = useLanguage()
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('lecteur');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const { showSuccess, showError } = useToast();

  // Charger les utilisateurs partagés quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && account) {
      loadSharedUsers();
    } else if (!isOpen) {
      // Réinitialiser les états quand le modal se ferme
      setEmail('');
      setSuggestions([]);
      setShowSuggestions(false);
      setError('');
    }
  }, [isOpen, account]);

  // Recherche d'utilisateurs pour autocomplétion
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si l'email est vide ou trop court, ne pas chercher
    if (!email || email.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Délai de 300ms avant de lancer la recherche (debounce)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const users = await apiService.searchUsers(email);
        setSuggestions(users || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', err);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    // Nettoyage
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [email]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  const selectSuggestion = (user) => {
    setEmail(user.email);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const loadSharedUsers = async () => {
    if (!account?.id_compte) return;
    
    try {
      setLoadingUsers(true);
      setError('');
      
      const result = await sharedAccountsService.getSharedUsersByAccount(account.id_compte);
      
      if (result.success) {
        const formattedUsers = result.data.map(user => sharedAccountsService.formatSharedUser(user));
        setSharedUsers(formattedUsers);
      } else {
        setError(result.error);
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs partagés:', err);
      setError(err.message);
      showError('Erreur lors du chargement des utilisateurs partagés');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleShare = async () => {
    if (!email || !email.includes('@')) {
      setError(t('portefeuille.errors.invalidEmail'));
      return;
    }

    if (!account?.id_compte) {
      setError(t('portefeuille.errors.accountNotFound'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await sharedAccountsService.shareAccount(account.id_compte, {
        email: email.trim(),
        role
      });

      if (result.success) {
        showSuccess(t('portefeuille.success.shareSuccess'));
        setEmail('');
        setRole('lecteur');
        setSuggestions([]);
        setShowSuggestions(false);
        // Recharger la liste des utilisateurs partagés
        await loadSharedUsers();
        // Notifier le parent pour recharger les données
        if (onShareSuccess) {
          onShareSuccess();
        }
      } else {
        setError(result.error);
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors du partage:', err);
      setError(err.message);
      showError(t('portefeuille.errors.shareError'));
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (shareId) => {
    if (!shareId) return;

    try {
      setLoading(true);
      setError('');

      const result = await sharedAccountsService.deleteSharedAccount(shareId);

      if (result.success) {
        showSuccess(t('portefeuille.success.removeUserSuccess'));
        // Recharger la liste des utilisateurs partagés
        await loadSharedUsers();
        // Notifier le parent pour recharger les données
        if (onShareSuccess) {
          onShareSuccess();
        }
      } else {
        setError(result.error);
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.message);
      showError(t('portefeuille.errors.removeError'));
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (shareId, newRole) => {
    if (!shareId || !newRole) return;

    try {
      setLoading(true);
      setError('');

      const result = await sharedAccountsService.updateSharedAccountRole(shareId, newRole);

      if (result.success) {
        showSuccess(t('portefeuille.success.roleUpdated'));
        // Recharger la liste des utilisateurs partagés
        await loadSharedUsers();
        // Notifier le parent pour recharger les données
        if (onShareSuccess) {
          onShareSuccess();
        }
      } else {
        setError(result.error);
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du rôle:', err);
      setError(err.message);
      showError(t('portefeuille.errors.roleUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('portefeuille.shareAccount')}: ${account?.nom || t('portefeuille.account')}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Ajouter un utilisateur */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('portefeuille.inviteUser')}</h3>
          <div className="flex space-x-3 relative">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder={t('portefeuille.emailPlaceholder')}
                className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={loading}
              />
              {/* Liste de suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar scroll-smooth"
                >
                  {searchLoading && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('portefeuille.searching')}</span>
                    </div>
                  )}
                  {!searchLoading && suggestions.map((user) => (
                    <button
                      key={user.id_user}
                      type="button"
                      onClick={() => selectSuggestion(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 dark:text-emerald-300 font-medium text-sm">
                            {user.prenom ? user.prenom.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showSuggestions && !searchLoading && suggestions.length === 0 && email.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg px-4 py-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('portefeuille.noUserFound')}</p>
                </div>
              )}
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={loading}
            >
              <option value="lecteur">{t('portefeuille.role.reader')}</option>
              <option value="contributeur">{t('portefeuille.role.contributor')}</option>
            </select>
            <button
              onClick={handleShare}
              disabled={loading || !email}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
              <UserPlus className="w-4 h-4" />
              )}
              <span>{loading ? t('portefeuille.sharing') : t('portefeuille.invite')}</span>
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t('portefeuille.usersWithAccess')}</h3>
          
          {loadingUsers ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('portefeuille.loadingUsers')}</p>
            </div>
          ) : sharedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('portefeuille.noSharedUsers')}</p>
            </div>
          ) : (
          <div className="space-y-2">
            {sharedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-300 font-medium text-sm">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName || user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.roleFormatted} - {user.role === 'proprietaire' && t('portefeuille.access.full')}
                        {user.role === 'contributeur' && t('portefeuille.access.canEdit')}
                        {user.role === 'lecteur' && t('portefeuille.access.readOnly')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="text-sm px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                      disabled={loading}
                  >
                    <option value="lecteur">{t('portefeuille.role.reader')}</option>
                    <option value="contributeur">{t('portefeuille.role.contributor')}</option>
                    <option value="proprietaire">{t('portefeuille.role.owner')}</option>
                  </select>
                  <button
                    onClick={() => removeUser(user.id)}
                      disabled={loading}
                      className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
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
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">{t('portefeuille.accessLevels')}</h4>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <p><strong>{t('portefeuille.role.reader')}:</strong> {t('portefeuille.access.readerDescription')}</p>
            <p><strong>{t('portefeuille.role.contributor')}:</strong> {t('portefeuille.access.contributorDescription')}</p>
            <p><strong>{t('portefeuille.role.owner')}:</strong> {t('portefeuille.access.ownerDescription')}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Composant Modal de Confirmation de Suppression
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, item }) => {
  const { t } = useLanguage()
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('portefeuille.confirmDelete')} size="sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 dark:bg-red-900 rounded-full p-3">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-300" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('portefeuille.deleteAccount')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('portefeuille.deleteMessage').replace('{name}', item?.nom || '')}<br />
          {t('portefeuille.irreversible')}
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('portefeuille.delete')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Composant Principal
export default function GestionnaireComptes() {
  const { t } = useLanguage()
  // États pour les comptes
  const [accounts, setAccounts] = useState([]);
  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharedLoading, setSharedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedError, setSharedError] = useState(null);
  
  // États pour les informations utilisateur
  const [userInfo, setUserInfo] = useState({
    devise: "MGA",
    deviseSymbol: "AR",
    email: "",
    id_user: null,
    nom: "",
    prenom: "",
    role: "user"
  });

  // Fonction de formatage des montants
  const formatAmount = (amount, currency = userInfo.devise) => {
    if (amount === null || amount === undefined) return '0';
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    // Formater avec séparateurs de milliers
    const formatted = numAmount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    // Retourner avec le symbole approprié
    return currency === 'MGA' ? `${formatted} AR` : `${formatted} ${currency}`;
  };

  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { showSuccess, showError } = useToast();

  // Charger les données utilisateur depuis localStorage
  useEffect(() => {
    const loadUserInfo = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUserInfo({
            devise: userData.devise || "MGA",
            deviseSymbol: userData.devise === "MGA" ? "AR" : userData.devise,
            email: userData.email || "",
            id_user: userData.id_user || null,
            nom: userData.nom || "",
            prenom: userData.prenom || "",
            role: userData.role || "user"
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
      }
    };

    loadUserInfo();
  }, []);

  // Charger les comptes depuis l'API (après que userInfo soit chargé)
  useEffect(() => {
    if (userInfo.id_user) {
      loadAccounts();
    }
  }, [userInfo.id_user]);

  // Charger les comptes partagés quand userInfo est disponible
  useEffect(() => {
    if (userInfo.id_user) {
      loadSharedAccounts();
    }
  }, [userInfo.id_user]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await accountsService.getMyAccounts();
      
      if (result.success) {
        // Formater les comptes pour l'affichage
        const formattedAccounts = result.data.map(account => accountsService.formatAccount(account));
        
        // Charger les informations de partage pour chaque compte
        const accountsWithShareInfo = await Promise.all(
          formattedAccounts.map(async (account) => {
            try {
              const shareResult = await sharedAccountsService.getSharedUsersByAccount(account.id_compte);
              if (shareResult.success && shareResult.data) {
                // Compter les utilisateurs partagés (en excluant le propriétaire)
                // Un compte est considéré comme partagé s'il y a au moins un utilisateur autre que le propriétaire
                const sharedUsers = shareResult.data.filter(user => user.id_user !== userInfo.id_user);
                const sharedCount = sharedUsers.length;
                return {
                  ...account,
                  isShared: sharedCount > 0,
                  sharedUsersCount: sharedCount
                };
              }
              return {
                ...account,
                isShared: false,
                sharedUsersCount: 0
              };
            } catch (err) {
              console.error(`Erreur lors du chargement des utilisateurs partagés pour le compte ${account.id_compte}:`, err);
              return {
                ...account,
                isShared: false,
                sharedUsersCount: 0
              };
            }
          })
        );
        
        setAccounts(accountsWithShareInfo);
      } else {
        setError(result.error);
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des comptes:', err);
      setError(err.message);
      showError('Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  };

  const loadSharedAccounts = async () => {
    try {
      setSharedLoading(true);
      setSharedError(null);
      
      if (!userInfo.id_user) {
        setSharedLoading(false);
        return;
      }
      
      const result = await sharedAccountsService.getSharedAccountsByUser(userInfo.id_user);
      
      if (result.success) {
        // Formater les comptes partagés pour l'affichage en préservant les données du propriétaire
        const formattedSharedAccounts = result.data.map(account => {
          console.log('=== Compte partagé brut (avant formatage) ===');
          console.log('Données complètes:', account);
          console.log('Nom du compte:', account.nom);
          console.log('Propriétaire - Nom:', account.proprietaire_nom);
          console.log('Propriétaire - Prénom:', account.proprietaire_prenom);
          console.log('Propriétaire - Email:', account.proprietaire_email);
          console.log('Propriétaire - Image:', account.proprietaire_image);
          console.log('ID utilisateur propriétaire:', account.id_user_proprietaire);
          console.log('Rôle:', account.role);
          console.log('==========================================');
          
          const formatted = sharedAccountsService.formatSharedAccount(account);
          // Préserver explicitement les données du propriétaire
          const finalAccount = {
            ...formatted,
            proprietaire_nom: account.proprietaire_nom,
            proprietaire_prenom: account.proprietaire_prenom,
            proprietaire_email: account.proprietaire_email,
            proprietaire_image: account.proprietaire_image,
            id_user_proprietaire: account.id_user_proprietaire
          };
          
          console.log('=== Compte partagé formaté (après formatage) ===');
          console.log('Données complètes formatées:', finalAccount);
          console.log('==========================================');
          
          return finalAccount;
        });
        console.log('=== LISTE COMPLÈTE DES COMPTES PARTAGÉS ===');
        console.log('Nombre de comptes:', formattedSharedAccounts.length);
        console.log('Liste complète:', formattedSharedAccounts);
        console.log('==========================================');
        setSharedAccounts(formattedSharedAccounts);
      } else {
        setSharedError(result.error);
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des comptes partagés:', err);
      setSharedError(err.message);
      showError('Erreur lors du chargement des comptes partagés');
    } finally {
      setSharedLoading(false);
    }
  };

  // Statistiques des comptes
  const stats = accountsService.calculateStats(accounts);
  const sharedStats = sharedAccountsService.calculateSharedStats(sharedAccounts);
  const totalAccountBalance = stats.totalBalance;
  const totalSharedBalance = sharedStats.totalBalance;

  const handleAccountSave = async (accountData) => {
    try {
      let result;
      
      if (selectedItem) {
        // Mise à jour d'un compte existant
        result = await accountsService.updateAccount(selectedItem.id_compte, accountData);
      if (result.success) {
        showSuccess(t('portefeuille.success.updateSuccess'));
      } else {
        showError(result.error);
        return;
      }
    } else {
      // Création d'un nouveau compte
      result = await accountsService.createAccount(accountData);
      if (result.success) {
        showSuccess(t('portefeuille.success.createSuccess'));
      } else {
        showError(result.error);
        return;
      }
    }
    
    // Recharger les comptes
    await loadAccounts();
    setSelectedItem(null);
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
    showError(t('portefeuille.errors.saveError'));
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
        showSuccess(t('portefeuille.success.deleteSuccess'));
        
        // Recharger les comptes
        await loadAccounts();
        setIsDeleteOpen(false);
        setSelectedItem(null);
      } else {
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      showError(t('portefeuille.errors.deleteError'));
    }
  };

  const handleShare = (account) => {
    setSelectedItem(account);
    setIsShareOpen(true);
  };

  const getAccountTypeIcon = (type) => {
    const iconClass = "w-6 h-6";
    switch (type?.toLowerCase()) {
      case 'courant':
        return <Landmark className={iconClass} />;
      case 'epargne':
        return <PiggyBank className={iconClass} />;
      case 'investissement':
        return <TrendingUp className={iconClass} />;
      case 'trading':
        return <BarChart3 className={iconClass} />;
      case 'crypto':
        return <Coins className={iconClass} />;
      case 'mobile_money':
      case 'mobile money':
        return <Smartphone className={iconClass} />;
      case 'cash':
      case 'espèces':
        return <Banknote className={iconClass} />;
      default:
        return <Wallet className={iconClass} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'courant':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
      case 'epargne':
        return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
      case 'investissement':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300';
      case 'trading':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300';
      case 'crypto':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300';
      case 'mobile_money':
      case 'mobile money':
        return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300';
      case 'cash':
      case 'espèces':
        return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen p-6" >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('portefeuille.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('portefeuille.subtitle')}</p>
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
              <span>{t('portefeuille.newAccount')}</span>
            </button>
            {/* Bouton de test temporaire */}
         
          </div>
        </div>


        {/* Statistiques des comptes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('portefeuille.myAccounts')}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <Wallet className="w-6 h-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('portefeuille.sharedAccounts')}</h3>
                <p className="text-3xl font-bold dark:text-white" style={{ color: colors.primary }}>{sharedStats.total}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <Users className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('portefeuille.totalBalance')}</h3>
                <p className="text-3xl font-bold dark:text-white" style={{ color: colors.secondary }}>{formatAmount(totalAccountBalance)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <TrendingUp className="w-6 h-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mes comptes (propriétaires) */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('portefeuille.myAccounts')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('portefeuille.myAccountsDescription')}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Wallet className="w-4 h-4" />
                <span>{accounts.length} {t('portefeuille.account')}{accounts.length > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('portefeuille.loadingAccounts')}</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-300 dark:text-red-600 mx-auto mb-4" />
                <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
                <button 
                  onClick={loadAccounts}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {t('portefeuille.retry')}
                </button>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('portefeuille.noAccountsFound')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('portefeuille.createFirstAccount')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <div 
                    key={account.id_compte} 
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-3 rounded-xl shadow-sm ${getTypeColor(account.type)}`}>
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">{account.nom}</h3>
                            {account.isShared && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full whitespace-nowrap">
                                ({t('portefeuille.shared')})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.typeFormatted || account.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleShare(account)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          title={t('portefeuille.share')}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAccountEdit(account)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900 rounded-lg transition-colors"
                          title={t('portefeuille.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title={t('portefeuille.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatAmount(account.solde)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('portefeuille.currentBalance')}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('portefeuille.owner')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                            <span className="text-emerald-600 dark:text-emerald-300 text-xs font-medium">
                              {userInfo.nom ? userInfo.nom.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <span className="text-emerald-600 dark:text-emerald-300 text-xs font-medium">{t('portefeuille.you')}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('portefeuille.sharedAccounts')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('portefeuille.sharedAccountsDescription')}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{sharedStats.total} {t('portefeuille.account')}{sharedStats.total > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            {sharedLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('portefeuille.loadingSharedAccounts')}</p>
              </div>
            ) : sharedError ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-300 dark:text-red-600 mx-auto mb-4" />
                <p className="text-red-500 dark:text-red-400 text-lg">{sharedError}</p>
                <button 
                  onClick={loadSharedAccounts}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {t('portefeuille.retry')}
                </button>
              </div>
            ) : sharedAccounts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('portefeuille.noSharedAccounts')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('portefeuille.sharedAccountsWillAppear')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedAccounts.map((account) => (
                  <div 
                    key={`shared-${account.id}`} 
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 relative"
                  >
                    {/* Badge "Partagé" */}
                    <div className="absolute -top-2 -right-2 bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {t('portefeuille.shared')}
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-xl shadow-sm ${getTypeColor(account.type)}`}>
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{account.nom}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.typeFormatted || account.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          account.role === 'proprietaire' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' :
                          account.role === 'contributeur' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {account.roleFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatAmount(account.solde)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('portefeuille.currentBalance')}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">{t('portefeuille.sharedBy')}</span>
                        <div className="flex items-center space-x-2">
                          {(() => {
                            // Récupérer UNIQUEMENT les données du propriétaire (pas le nom du compte)
                            const firstName = account.proprietaire_prenom || ''
                            const lastName = account.proprietaire_nom || ''
                            const email = account.proprietaire_email || ''
                            const fullName = `${firstName} ${lastName}`.trim()
                            // Ne pas utiliser account.nom car c'est le nom du compte, pas de l'utilisateur
                            const displayName = fullName || (email ? email.split('@')[0] : '') || 'Utilisateur'
                            const API_ORIGIN = API_CONFIG.BASE_URL.replace(/\/api$/, '')
                            const imageUrl = account.proprietaire_image ? `${API_ORIGIN}/uploads/${account.proprietaire_image}` : null
                            const initial = (firstName || lastName || email || 'U').charAt(0).toUpperCase()

                            // Debug: afficher les données disponibles
                            if (!fullName && !email) {
                              console.warn('Données propriétaire manquantes pour le compte:', account.id_compte, {
                                proprietaire_nom: account.proprietaire_nom,
                                proprietaire_prenom: account.proprietaire_prenom,
                                proprietaire_email: account.proprietaire_email,
                                account_nom: account.nom // nom du compte (à ne pas utiliser)
                              });
                            }

                            return (
                              <>
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={displayName}
                                    className="w-6 h-6 rounded-full object-cover border-2 border-white dark:border-gray-800"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                                    <span className="text-blue-600 dark:text-blue-300 text-xs font-medium">{initial}</span>
                                  </div>
                                )}
                                <span className="text-blue-600 dark:text-blue-300 text-xs font-medium" title={email || displayName}>
                                  {displayName}
                                </span>
                              </>
                            )
                          })()}
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
        onSave={async (accountData) => {
          await handleAccountSave(accountData);
          // Fermer le modal après la sauvegarde
          setIsAccountFormOpen(false);
        }}
        item={selectedItem}
      />

      <ShareAccountModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setSelectedItem(null);
        }}
        account={selectedItem}
        onShareSuccess={() => {
          // Recharger les comptes partagés après un changement
          loadSharedAccounts();
          // Recharger aussi les comptes pour mettre à jour l'indicateur "(partagé)"
          loadAccounts();
        }}
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