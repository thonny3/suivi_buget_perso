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
  Loader2
} from 'lucide-react'
import { colors } from '@/styles/colors'
import accountsService from '@/services/accountsService'
import sharedAccountsService from '@/services/sharedAccountsService'
import apiService from '@/services/apiService'
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
    nom: '',
    type: 'courant',
    solde: ''
  });

  const [errors, setErrors] = useState({});

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
            {accountsService.getAvailableTypes().map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solde initial (AR)
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
            onClick={onClose}
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
const ShareAccountModal = ({ isOpen, onClose, account, onShareSuccess }) => {
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
      setError('Veuillez entrer un email valide');
      return;
    }

    if (!account?.id_compte) {
      setError('Compte non trouvé');
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
        showSuccess('Compte partagé avec succès');
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
      showError('Erreur lors du partage du compte');
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
        showSuccess('Utilisateur retiré du partage');
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
      showError('Erreur lors de la suppression du partage');
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
        showSuccess('Rôle mis à jour avec succès');
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
      showError('Erreur lors de la mise à jour du rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Partager le compte: ${account?.nom || 'Compte'}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Ajouter un utilisateur */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Inviter un utilisateur</h3>
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
                placeholder="email@exemple.com"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={loading}
              />
              {/* Liste de suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {searchLoading && (
                    <div className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Recherche...</span>
                    </div>
                  )}
                  {!searchLoading && suggestions.map((user) => (
                    <button
                      key={user.id_user}
                      type="button"
                      onClick={() => selectSuggestion(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 font-medium text-sm">
                            {user.prenom ? user.prenom.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showSuggestions && !searchLoading && suggestions.length === 0 && email.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3">
                  <p className="text-sm text-gray-500">Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={loading}
            >
              <option value="lecteur">Lecteur</option>
              <option value="contributeur">Contributeur</option>
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
              <span>{loading ? 'Partage...' : 'Inviter'}</span>
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Utilisateurs avec accès</h3>
          
          {loadingUsers ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-spin" />
              <p className="text-gray-500 text-sm">Chargement des utilisateurs...</p>
            </div>
          ) : sharedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aucun utilisateur partagé</p>
            </div>
          ) : (
          <div className="space-y-2">
            {sharedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-medium text-sm">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-900">{user.displayName || user.email}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500">
                        {user.roleFormatted} - {user.role === 'proprietaire' && 'Accès complet'}
                        {user.role === 'contributeur' && 'Peut modifier'}
                        {user.role === 'lecteur' && 'Lecture seule'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="text-sm px-2 py-1 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                      disabled={loading}
                  >
                    <option value="lecteur">Lecteur</option>
                    <option value="contributeur">Contributeur</option>
                    <option value="proprietaire">Propriétaire</option>
                  </select>
                  <button
                    onClick={() => removeUser(user.id)}
                      disabled={loading}
                      className="p-1 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
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
          showSuccess('Compte mis à jour avec succès');
        } else {
          showError(result.error);
          return;
        }
      } else {
        // Création d'un nouveau compte
        result = await accountsService.createAccount(accountData);
        if (result.success) {
          showSuccess('Compte créé avec succès');
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
      showError('Erreur lors de la sauvegarde du compte');
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
        showSuccess('Compte supprimé avec succès');
        
        // Recharger les comptes
        await loadAccounts();
        setIsDeleteOpen(false);
        setSelectedItem(null);
      } else {
        showError(result.error);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      showError('Erreur lors de la suppression du compte');
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
            {/* Bouton de test temporaire */}
         
          </div>
        </div>


        {/* Statistiques des comptes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Mes comptes</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>{sharedStats.total}</p>
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
                <p className="text-3xl font-bold" style={{ color: colors.secondary }}>{formatAmount(totalAccountBalance)}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: colors.light }}>
                <TrendingUp className="w-6 h-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mes comptes (propriétaires) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
              <h2 className="text-xl font-semibold text-gray-900">Mes comptes</h2>
                <p className="text-sm text-gray-500 mt-1">Vos comptes personnels que vous gérez</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Wallet className="w-4 h-4" />
                <span>{accounts.length} compte{accounts.length > 1 ? 's' : ''}</span>
              </div>
            </div>
            
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
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-3 rounded-lg ${getTypeColor(account.type)}`}>
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-lg truncate">{account.nom}</h3>
                            {account.isShared && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                                (partagé)
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 capitalize">{account.typeFormatted || account.type}</p>
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
                      <p className="text-3xl font-bold text-gray-900">{formatAmount(account.solde)}</p>
                      <p className="text-sm text-gray-500 mt-1">Solde actuel</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Propriétaire</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-emerald-600 text-xs font-medium">
                              {userInfo.nom ? userInfo.nom.charAt(0).toUpperCase() : 'U'}
                            </span>
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
            <div className="flex items-center justify-between mb-4">
              <div>
              <h2 className="text-xl font-semibold text-gray-900">Comptes partagés</h2>
                <p className="text-sm text-gray-500 mt-1">Comptes partagés avec vous par d'autres utilisateurs</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{sharedStats.total} compte{sharedStats.total > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            {sharedLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500 text-lg">Chargement des comptes partagés...</p>
              </div>
            ) : sharedError ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500 text-lg">{sharedError}</p>
                <button 
                  onClick={loadSharedAccounts}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : sharedAccounts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun compte partagé</p>
                <p className="text-sm text-gray-400 mt-1">Les comptes partagés avec vous apparaîtront ici</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedAccounts.map((account) => (
                  <div 
                    key={`shared-${account.id}`} 
                    className="rounded-xl border-2 border-dashed p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 relative"
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      borderColor: '#e2e8f0',
                      borderStyle: 'dashed'
                    }}
                  >
                    {/* Badge "Partagé" */}
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Partagé
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${getTypeColor(account.type)}`}>
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{account.nom}</h3>
                          <p className="text-sm text-gray-500 capitalize">{account.typeFormatted || account.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          account.role === 'proprietaire' ? 'bg-purple-100 text-purple-600' :
                          account.role === 'contributeur' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {account.roleFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-3xl font-bold text-gray-900">{formatAmount(account.solde)}</p>
                      <p className="text-sm text-gray-500 mt-1">Solde actuel</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Partagé par</span>
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
                                    className="w-6 h-6 rounded-full object-cover border-2 border-white"
                                  />
                                ) : (
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                                    <span className="text-blue-600 text-xs font-medium">{initial}</span>
                                  </div>
                                )}
                                <span className="text-blue-600 text-xs font-medium" title={email || displayName}>
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