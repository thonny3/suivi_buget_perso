"use client"
import React, { useEffect, useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  AlertTriangle,
  Euro,
  CreditCard,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Smartphone,
  Heart,
  Briefcase,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart
} from 'lucide-react'
import { colors } from '@/styles/colors'
import depensesService from '@/services/depensesService'
import sharedAccountsService from '@/services/sharedAccountsService'
import apiService from '@/services/apiService'
import { API_CONFIG } from '@/config/api'
import logo from '@/image/logo.png'
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

// Fonction pour normaliser une date au format YYYY-MM-DD
const normalizeDateForInput = (dateValue) => {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  
  // Si c'est déjà au format YYYY-MM-DD, l'utiliser directement
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // Sinon, essayer de parser la date en évitant les problèmes de fuseau horaire
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    
    // Utiliser les composants locaux pour éviter les problèmes de fuseau horaire
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

// Composant Formulaire Dépense
const ExpenseForm = ({ isOpen, onClose, onSave, item = null, categories = [], comptes = [] }) => {
  const [formData, setFormData] = useState({
    description: item?.description || '',
    montant: item?.montant || '',
    date_depense: normalizeDateForInput(item?.date_depense),
    id_categorie_depense: item?.id_categorie_depense || '',
    id_compte: item?.id_compte || ''
  });

  useEffect(() => {
    setFormData({
      description: item?.description || '',
      montant: item?.montant || '',
      date_depense: normalizeDateForInput(item?.date_depense),
      id_categorie_depense: item?.id_categorie_depense || '',
      id_compte: item?.id_compte || ''
    })
  }, [item])

  const [errors, setErrors] = useState({});

  

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.montant || formData.montant <= 0) newErrors.montant = 'Le montant doit être positif';
    if (!formData.id_categorie_depense) newErrors.id_categorie_depense = 'Veuillez sélectionner une catégorie';
    if (!formData.id_compte) newErrors.id_compte = 'Veuillez sélectionner un compte';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        description: formData.description,
        montant: parseFloat(formData.montant),
        date_depense: formData.date_depense,
        id_categorie_depense: parseInt(formData.id_categorie_depense),
        id_compte: parseInt(formData.id_compte)
      });
      onClose();
      setFormData({
        description: '',
        montant: '',
        date_depense: new Date().toISOString().split('T')[0],
        id_categorie_depense: '',
        id_compte: ''
      });
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
      title={item ? 'Modifier la dépense' : 'Ajouter une dépense'}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Courses Carrefour"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant 
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.montant}
              onChange={(e) => handleChange('montant', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.montant ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.montant && <p className="text-red-500 text-sm mt-1">{errors.montant}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date_depense}
              onChange={(e) => handleChange('date_depense', e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            value={formData.id_categorie_depense}
            onChange={(e) => handleChange('id_categorie_depense', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.id_categorie_depense ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nom}
              </option>
            ))}
          </select>
          {errors.id_categorie_depense && <p className="text-red-500 text-sm mt-1">{errors.id_categorie_depense}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compte
          </label>
          <select
            value={formData.id_compte}
            onChange={(e) => handleChange('id_compte', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.id_compte ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner un compte</option>
            {comptes.map((compte) => (
              <option key={(compte.id_compte ?? compte.id)} value={(compte.id_compte ?? compte.id)}>
                {compte.nom} ({compte.type}) {compte.isShared ? '— partagé (contributeur)' : ''}
              </option>
            ))}
          </select>
          {errors.id_compte && <p className="text-red-500 text-sm mt-1">{errors.id_compte}</p>}
          {formData.id_compte && (() => {
            const selected = comptes.find(c => (c.id_compte ?? c.id) === parseInt(formData.id_compte))
            const solde = Number(selected?.solde || 0)
            const symbol = selected?.currencySymbol || selected?.devise || selected?.currency || '€'
            return selected ? (
              <p className="text-sm text-gray-500 mt-2">
                Solde du compte: {solde.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {symbol}
              </p>
            ) : null
          })()}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              setFormData({
                description: '',
                montant: '',
                date_depense: new Date().toISOString().split('T')[0],
                id_categorie_depense: '',
                id_compte: ''
              });
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
            <span>{item ? 'Mettre à jour' : 'Ajouter'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Modal de Détails
const ExpenseDetailsModal = ({ isOpen, onClose, expense }) => {
  if (!expense) return null;

  const categories = [
    { id: 1, nom: 'Alimentation', couleur: 'bg-green-500', icon: Coffee },
    { id: 2, nom: 'Transport', couleur: 'bg-blue-500', icon: Car },
    { id: 3, nom: 'Logement', couleur: 'bg-orange-500', icon: Home },
    { id: 4, nom: 'Loisirs', couleur: 'bg-purple-500', icon: Heart },
    { id: 5, nom: 'Santé', couleur: 'bg-red-500', icon: Heart },
    { id: 6, nom: 'Shopping', couleur: 'bg-pink-500', icon: ShoppingCart },
    { id: 7, nom: 'Technologie', couleur: 'bg-indigo-500', icon: Smartphone },
    { id: 8, nom: 'Professionnel', couleur: 'bg-gray-500', icon: Briefcase }
  ];

  const comptes = [
    { id: 1, nom: 'Compte Principal', type: 'courant' },
    { id: 2, nom: 'Épargne', type: 'epargne' },
    { id: 3, nom: 'Carte de Crédit', type: 'credit' }
  ];

  const category = categories.find(c => c.id === expense.id_categorie_depense);
  const compte = comptes.find(c => c.id === expense.id_compte);
  const IconComponent = category?.icon || Coffee;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de la dépense" size="md">
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{expense.description}</h3>
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${category?.couleur || 'bg-gray-500'} text-white`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <span className="text-gray-700">{category?.nom || 'Sans catégorie'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Montant</p>
            <p className="text-2xl font-bold text-gray-900">{expense.montant}€</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Date</p>
            <p className="text-xl font-bold text-gray-900">
              {new Date(expense.date_depense).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Compte utilisé</p>
          <p className="text-lg font-semibold text-gray-900">
            {compte?.nom || 'Compte inconnu'} 
            <span className="text-sm text-gray-500 ml-2">({compte?.type || 'N/A'})</span>
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900 font-medium">
              Ajoutée le {new Date(expense.date_depense).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Modal de Confirmation de Suppression
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, expense }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression" size="sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Supprimer cette dépense ?
        </h3>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer "{expense?.description}" ?<br />
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
export default function GestionDepenses() {
  const { showSuccess, showError } = useToast();
  
  const normalizeDate = (value) => {
    if (!value) return new Date().toISOString().slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    try {
      const d = new Date(value)
      if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10)
      return d.toISOString().slice(0, 10)
    } catch {
      return new Date().toISOString().slice(0, 10)
    }
  }
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([])
  const [comptes, setComptes] = useState([])
  const [usersById, setUsersById] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError('')
        const [deps, cats, myAccs] = await Promise.all([
          depensesService.getDepenses(),
          depensesService.getDepenseCategories(),
          depensesService.getMyComptes(),
        ])
        console.log('Dépenses chargées:', deps)
        // Load shared accounts where current user is contributeur
        let sharedContrib = []
        try {
          const storedUser = localStorage.getItem('user')
          const userId = storedUser ? (JSON.parse(storedUser)?.id_user || null) : null
          if (userId) {
            const sharedRes = await sharedAccountsService.getSharedAccountsByUser(userId)
            if (sharedRes?.success && Array.isArray(sharedRes.data)) {
              // Format shared accounts
              const baseShared = sharedRes.data
                .map(acc => sharedAccountsService.formatSharedAccount(acc))
                .filter(acc => acc.role === 'contributeur')

              // Enrich with account details for currency/devise
              const detailedShared = await Promise.all(baseShared.map(async (acc) => {
                try {
                  const accountId = acc.id_compte ?? acc.id
                  const details = accountId ? await apiService.getAccountById(accountId) : null
                  const devise = details?.devise || details?.currency || acc.devise || acc.currency || ''
                  const currencySymbol = (devise && devise.toUpperCase() === 'MGA') ? 'Ar' : (details?.currencySymbol || acc.currencySymbol)
                  return { ...acc, devise, currency: devise, currencySymbol, isShared: true }
                } catch (_) {
                  return { ...acc, isShared: true }
                }
              }))
              const formattedShared = detailedShared
              sharedContrib = formattedShared
            }
          }
        } catch (_) {}

        setExpenses(Array.isArray(deps) ? deps : [])
        setCategories(Array.isArray(cats) ? cats : [])
        // Merge own accounts and shared contributor accounts
        const ownAccounts = Array.isArray(myAccs) ? myAccs : []
        const mergedAccs = [...ownAccounts, ...sharedContrib]
        setComptes(mergedAccs)

        // Build user map: include current user and shared users per account
        const userMap = {}
        try {
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            const u = JSON.parse(storedUser)
            if (u?.id_user) {
              userMap[u.id_user] = {
                id_user: u.id_user,
                prenom: u.prenom,
                nom: u.nom,
                email: u.email,
                image: u.image || null
              }
            }
          }
        } catch {}

        // Fetch shared users for each account to resolve names by id_user
        const accountIds = Array.from(new Set(mergedAccs.map(a => (a.id_compte ?? a.id)).filter(Boolean)))
        try {
          const lists = await Promise.all(accountIds.map(async (accId) => {
            try {
              const res = await sharedAccountsService.getSharedUsersByAccount(accId)
              return Array.isArray(res?.data) ? res.data : []
            } catch {
              return []
            }
          }))
          lists.flat().forEach(u => {
            const id = u.id_user ?? u.user_id ?? u.id
            if (!id) return
            userMap[id] = {
              id_user: id,
              prenom: u.prenom || u.firstName || '',
              nom: u.nom || u.lastName || '',
              email: u.email || '',
              image: u.image || u.image_utilisateur || null
            }
          })
        } catch {}
        setUsersById(userMap)
      } catch (e) {
        const errorMessage = e.message || 'Erreur lors du chargement des dépenses'
        setError(errorMessage)
        showError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log('Dépenses (state):', expenses)
  }, [expenses])

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  

  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtrage et recherche
  const filteredExpenses = expenses.filter(expense => {
    const desc = (expense.description ?? '').toString().toLowerCase()
    const matchesSearch = desc.includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || String(expense.id_categorie_depense ?? '') === filterCategory;
    
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const expenseDate = new Date(expense.date_depense);
      const today = new Date();
      
      switch (filterDateRange) {
        case 'today':
          matchesDate = expenseDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

  // Statistiques
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.montant || 0), 0);
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date_depense);
    const today = new Date();
    return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
  }).reduce((sum, expense) => sum + Number(expense.montant || 0), 0);

  const todaysExpenses = expenses.filter(expense => {
    const d = new Date(expense.date_depense)
    const t = new Date()
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
  }).reduce((sum, e) => sum + Number(e.montant || 0), 0)

  const categoryStats = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.id_categorie_depense === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + Number(expense.montant || 0), 0);
    return {
      ...category,
      total,
      count: categoryExpenses.length
    };
  }).filter(stat => stat.total > 0).sort((a, b) => b.total - a.total);

  const handleSave = async (expenseData) => {
    try {
      setError('')
      const payload = {
        description: expenseData.description,
        montant: Number(expenseData.montant),
        date_depense: normalizeDate(expenseData.date_depense),
        id_categorie_depense: Number(expenseData.id_categorie_depense),
        id_compte: Number(expenseData.id_compte),
      }
      if (selectedExpense) {
        await depensesService.updateDepense(selectedExpense.id_depense, payload)
        showSuccess('Dépense mise à jour avec succès')
      } else {
        await depensesService.createDepense(payload)
        showSuccess('Dépense créée avec succès')
      }
      const fresh = await depensesService.getDepenses()
      setExpenses(Array.isArray(fresh) ? fresh : [])
    } catch (e) {
      const errorMessage = e.message || 'Erreur lors de l\'enregistrement'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setSelectedExpense(null)
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = (expense) => {
    setSelectedExpense(expense);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedExpense) return
      await depensesService.deleteDepense(selectedExpense.id_depense)
      showSuccess('Dépense supprimée avec succès')
      const fresh = await depensesService.getDepenses()
      setExpenses(Array.isArray(fresh) ? fresh : [])
    } catch (e) {
      const errorMessage = e.message || 'Erreur lors de la suppression'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsDeleteOpen(false)
      setSelectedExpense(null)
    }
  };

  const handleDetails = (expense) => {
    setSelectedExpense(expense);
    setIsDetailsOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nom : 'Sans catégorie';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return (category && category.icon) ? category.icon : Coffee;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.couleur : 'bg-gray-500';
  };

  const getAccountName = (accountId) => {
    const account = comptes.find(c => (c.id_compte ?? c.id) === accountId);
    return account ? account.nom : 'Compte inconnu';
  };

  const getUserInfo = (userId) => {
    const info = usersById[userId]
    if (info) return info
    return { id_user: userId, prenom: '', nom: '', email: '', image: null }
  }

  const getUserImageUrl = (user) => {
    const img = user?.image
    if (!img) return null
    if (/^https?:\/\//i.test(img)) return img
    const API_ORIGIN = API_CONFIG.BASE_URL.replace(/\/api$/, '')
    // If img already includes uploads path, avoid duplicating it
    const cleaned = img.replace(/^\/+/, '')
    if (cleaned.toLowerCase().startsWith('uploads/')) {
      return `${API_ORIGIN}/${cleaned}`
    }
    return `${API_ORIGIN}/uploads/${cleaned}`
  }

  const getAccountCurrencySymbol = (accountId) => {
    const account = comptes.find(c => (c.id_compte ?? c.id) === accountId)
    const devise = (account?.devise || account?.currency || '').toString().toUpperCase()
    if (devise === 'MGA') return 'Ar'
    // Fallback to user's currency if account not found
    if (!account) {
      try {
        const user = localStorage.getItem('user')
        const userDevise = user ? (JSON.parse(user)?.devise || '').toString().toUpperCase() : ''
        if (userDevise === 'MGA') return 'Ar'
        return userDevise || '€'
      } catch {
        return '€'
      }
    }
    return account?.currencySymbol || account?.devise || account?.currency || '€'
  }

  const isAccountMGA = (accountId) => {
    const account = comptes.find(c => (c.id_compte ?? c.id) === accountId)
    const code = (account?.devise || account?.currency || '').toString().toUpperCase()
    const symbol = (account?.currencySymbol || '').toString()
    if (code === 'MGA' || symbol === 'Ar') return true
    // Fallback to user's currency
    try {
      const user = localStorage.getItem('user')
      const userDevise = user ? (JSON.parse(user)?.devise || '').toString().toUpperCase() : ''
      return userDevise === 'MGA'
    } catch {
      return false
    }
  }

  const formatAmountForAccount = (amount, accountId) => {
    const num = Number(amount || 0)
    if (isAccountMGA(accountId)) {
      // Ariary: space thousands, no decimals, suffix 'Ar'
      const intStr = Math.round(num).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
      return `${intStr} Ar`
    }
    const symbol = getAccountCurrencySymbol(accountId)
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${symbol}`
  }

  const getDefaultCurrencySymbol = () => {
    const first = comptes && comptes.length > 0 ? comptes[0] : null
    const code = (first?.devise || first?.currency || '').toString().toUpperCase()
    if (code === 'MGA') return 'Ar'
    return first?.currencySymbol || first?.devise || first?.currency || '€'
  }

  const formatAmountDefault = (amount) => {
    const first = comptes && comptes.length > 0 ? comptes[0] : null
    const code = (first?.devise || first?.currency || '').toString().toUpperCase()
    const num = Number(amount || 0)
    if (code === 'MGA') {
      const intStr = Math.round(num).toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
      return `${intStr} Ar`
    }
    const symbol = getDefaultCurrencySymbol()
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${symbol}`
  }

  const formatDateFr = (dateStr) => {
    if (!dateStr) return ''
    try { return new Date(dateStr).toLocaleDateString('fr-FR') } catch { return '' }
  }

  const getLogoDataUrl = async () => {
    try {
      const logoUrl = (typeof logo === 'string') ? logo : (logo?.src || '')
      if (!logoUrl) return ''
      const res = await fetch(logoUrl)
      const blob = await res.blob()
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    } catch {
      return ''
    }
  }

  const exportToPDF = async () => {
    const win = window.open('', '_blank')
    if (!win) return
    const appName = 'Jalako'
    const exportedAt = new Date().toLocaleString('fr-FR')
    const logoDataUrl = await getLogoDataUrl()
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 28px; color: #111827; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand h1 { font-size: 20px; margin: 0; font-weight: 700; }
        .meta { font-size: 12px; color: #6b7280; text-align: right; }
        .logo { width: 40px; height: 40px; object-fit: contain; border-radius: 8px; }
        .cards { display: flex; gap: 12px; margin: 16px 0 20px; }
        .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; }
        .card .label { font-size: 11px; color: #6b7280; }
        .card .value { font-size: 16px; font-weight: 700; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; font-size: 12px; }
        thead th { background: #f3f4f6; text-align: left; font-weight: 700; }
        tbody tr:nth-child(odd) { background: #fcfdff; }
        .footer { margin-top: 14px; font-size: 11px; color: #6b7280; display:flex; justify-content: space-between; }
      </style>
    `
    const header = `
      <div class=\"header\">\n        <div class=\"brand\">\n          ${logoDataUrl ? `<img class=\\"logo\\" src=\\"${logoDataUrl}\\" alt=\\"Logo\\" />` : ''}\n          <h1>${appName} — Liste des dépenses</h1>\n        </div>\n        <div class=\"meta\">\n          Exporté le ${exportedAt}\n        </div>\n      </div>\n    `
    const totalLabel = 'Total des dépenses'
    const totalValue = `${formatAmountDefault(totalExpenses)}`
    const countLabel = 'Nombre de lignes'
    const countValue = `${filteredExpenses.length}`
    const cards = `
      <div class=\"cards\">\n        <div class=\"card\">\n          <div class=\"label\">${totalLabel}</div>\n          <div class=\"value\">${totalValue}</div>\n        </div>\n        <div class=\"card\">\n          <div class=\"label\">${countLabel}</div>\n          <div class=\"value\">${countValue}</div>\n        </div>\n      </div>
    `
    const thead = '<tr><th>ID</th><th>Description</th><th>Catégorie</th><th>Compte</th><th>Montant</th><th>Date</th></tr>'
    const rows = filteredExpenses.map(e => `
      <tr>
        <td>${e.id_depense ?? ''}</td>
        <td>${(e.description ?? '').toString().replace(/</g,'&lt;')}</td>
        <td>${getCategoryName(e.id_categorie_depense)}</td>
        <td>${getAccountName(e.id_compte)}</td>
        <td>${formatAmountForAccount(e.montant, e.id_compte)}</td>
        <td>${formatDateFr(e.date_depense)}</td>
      </tr>
    `).join('')
    const footer = `<div class=\"footer\"><span>${appName}</span><span>${exportedAt}</span></div>`
    win.document.write(`<!doctype html><html><head><meta charset=\"utf-8\"/>${styles}</head><body>${header}${cards}<table><thead>${thead}</thead><tbody>${rows}</tbody></table>${footer}</body></html>`) 
    win.document.close()
    win.focus()
    setTimeout(() => { try { win.print() } catch(_) {} }, 300)
  }

  // removed duplicate getDefaultCurrencySymbol

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes Dépenses</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gérez et analysez vos dépenses quotidiennes</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSelectedExpense(null);
                setIsFormOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle dépense</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Total des dépenses</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{formatAmountDefault(totalExpenses)}</p>
          </div>
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Ce mois</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{formatAmountDefault(monthlyExpenses)}</p>
          </div>
      
          <div className="rounded-2xl p-6 bg-white shadow-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Dépense aujourd'hui</h3>
            <p className="text-2xl font-bold mt-2 text-gray-900">{formatAmountDefault(todaysExpenses)}</p>
          </div>
        </div>

     

      {/* Analyse rapide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top catégories */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Top Catégories</span>
          </h3>
          <div className="space-y-3">
            {categoryStats.slice(0, 5).map((stat, index) => {
              const percentage = totalExpenses > 0 ? ((stat.total / totalExpenses) * 100).toFixed(1) : 0;
              return (
                <div key={stat.id} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-sm font-medium text-gray-500 w-4">#{index + 1}</span>
                    <span className="font-medium text-gray-900">{stat.nom}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatAmountDefault(stat.total)}</p>
                    <p className="text-sm text-gray-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tendances */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Analyse</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900 font-medium">Dépense la plus élevée</span>
              </div>
              <span className="font-bold text-blue-900">{formatAmountDefault(Math.max(...expenses.map(e => Number(e.montant || 0))))}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-green-900 font-medium">Dépense la plus faible</span>
              </div>
              <span className="font-bold text-green-900">{formatAmountDefault(Math.min(...expenses.map(e => Number(e.montant || 0))))}</span>
            </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-purple-900 font-medium">Dépense aujourd'hui</span>
              </div>
              <span className="font-bold text-purple-900">{formatAmountDefault(todaysExpenses)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span className="text-orange-900 font-medium">Dernière dépense</span>
              </div>
              <span className="font-bold text-orange-900">
                {expenses.length > 0 
                  ? new Date(Math.max(...expenses.map(e => new Date(e.date_depense)))).toLocaleDateString('fr-FR')
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
   {/* Section "Dépenses par catégorie" supprimée */}
        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une dépense..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">Par page</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setCurrentPage(1); setItemsPerPage(parseInt(e.target.value)) }}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button onClick={exportToPDF} className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap">Exporter PDF</button>
              </div>
            </div>
          </div>
        </div>
        {/* Tableau des dépenses */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">Description</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">Catégorie</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm hidden md:table-cell">Compte</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm hidden lg:table-cell">Utilisateur</th>
                  <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">Montant</th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">Date</th>
                  <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-gray-600 font-medium text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">Chargement...</td>
                  </tr>
                ) : paginatedExpenses.map((expense) => {
                  const IconComponent = getCategoryIcon(expense.id_categorie_depense);
                  // Prefer backend-provided user fields on expense; fallback to usersById map
                  const backendUser = {
                    prenom: expense.user_prenom,
                    nom: expense.user_nom,
                    email: expense.user_email,
                    image: expense.user_image,
                  }
                  const hasBackendUser = backendUser.prenom || backendUser.nom || backendUser.email || backendUser.image
                  const u = hasBackendUser ? backendUser : getUserInfo(expense.id_user)
                  const displayName = (u.prenom || u.nom) ? `${u.prenom || ''} ${u.nom || ''}`.trim() : (u.email || `ID: ${expense.id_user}`)
                  const initial = (u.prenom || u.nom || u.email || 'U').toString().trim().charAt(0).toUpperCase()
                  return (
                    <tr key={expense.id_depense} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{expense.description}</p>
                          
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <span className="text-xs sm:text-sm text-gray-700">
                          {getCategoryName(expense.id_categorie_depense)}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 hidden md:table-cell">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {getAccountName(expense.id_compte)}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 hidden lg:table-cell">
                        <div className="flex items-center space-x-2">
                          {getUserImageUrl(u) ? (
                            <img src={getUserImageUrl(u)} alt={displayName} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          ) : (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-full flex items-center justify-center border">
                              <span className="text-emerald-700 text-xs font-medium">{initial}</span>
                            </div>
                          )}
                          <span className="text-xs sm:text-sm text-gray-700">{displayName}</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                        <span className="text-base sm:text-lg font-bold text-red-600">
                          {formatAmountForAccount(expense.montant, expense.id_compte)}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 text-gray-900 text-xs sm:text-sm">
                        {new Date(expense.date_depense).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!isLoading && paginatedExpenses.length === 0 && (
              <div className="text-center py-12">
                <Euro className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune dépense trouvée</p>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredExpenses.length === 0 && expenses.length > 0 
                    ? "Essayez de modifier vos filtres de recherche" 
                    : "Commencez par ajouter votre première dépense"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 gap-3 sm:gap-0">
              <p className="text-gray-600 text-xs sm:text-sm text-center sm:text-left">
                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredExpenses.length)} sur {filteredExpenses.length} résultats
              </p>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 rounded border border-gray-300 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-xs sm:text-sm text-gray-500">Page {currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 py-1 rounded border border-gray-300 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

       
      </div>

      {/* Modals */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedExpense(null);
        }}
        onSave={handleSave}
        item={selectedExpense}
        categories={categories}
        comptes={comptes}
      />

      <ExpenseDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedExpense(null);
        }}
        onConfirm={confirmDelete}
        expense={selectedExpense}
      />
    </div>
  );
}