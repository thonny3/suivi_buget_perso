"use client"
import React, { useState } from 'react'
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

// Composant Formulaire Dépense
const ExpenseForm = ({ isOpen, onClose, onSave, item = null }) => {
  const [formData, setFormData] = useState({
    description: item?.description || '',
    montant: item?.montant || '',
    date_depense: item?.date_depense || new Date().toISOString().split('T')[0],
    id_categorie_depense: item?.id_categorie_depense || '',
    id_compte: item?.id_compte || ''
  });

  const [errors, setErrors] = useState({});

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
        ...formData,
        id_depense: item?.id_depense || Date.now(),
        id_user: 1, // Utilisateur actuel simulé
        montant: parseFloat(formData.montant),
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
              Montant (€)
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
              <option key={compte.id} value={compte.id}>
                {compte.nom} ({compte.type})
              </option>
            ))}
          </select>
          {errors.id_compte && <p className="text-red-500 text-sm mt-1">{errors.id_compte}</p>}
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
            <p className="text-2xl font-bold text-gray-900">{expense.montant.toFixed(2)}€</p>
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
  const [expenses, setExpenses] = useState([
    {
      id_depense: 1,
      id_user: 1,
      description: "Courses Carrefour",
      montant: 85.50,
      date_depense: "2024-08-15",
      id_categorie_depense: 1,
      id_compte: 1
    },
    {
      id_depense: 2,
      id_user: 1,
      description: "Essence Station Shell",
      montant: 45.20,
      date_depense: "2024-08-14",
      id_categorie_depense: 2,
      id_compte: 1
    },
    {
      id_depense: 3,
      id_user: 1,
      description: "Netflix Abonnement",
      montant: 15.99,
      date_depense: "2024-08-13",
      id_categorie_depense: 4,
      id_compte: 2
    },
    {
      id_depense: 4,
      id_user: 1,
      description: "Pharmacie",
      montant: 23.75,
      date_depense: "2024-08-12",
      id_categorie_depense: 5,
      id_compte: 1
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

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

  const itemsPerPage = 10;

  // Filtrage et recherche
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.id_categorie_depense.toString() === filterCategory;
    
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
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.montant, 0);
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date_depense);
    const today = new Date();
    return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
  }).reduce((sum, expense) => sum + expense.montant, 0);

  const categoryStats = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.id_categorie_depense === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.montant, 0);
    return {
      ...category,
      total,
      count: categoryExpenses.length
    };
  }).filter(stat => stat.total > 0).sort((a, b) => b.total - a.total);

  const handleSave = (expenseData) => {
    if (selectedExpense) {
      setExpenses(prev => prev.map(expense =>
        expense.id_depense === selectedExpense.id_depense ? expenseData : expense
      ));
    } else {
      setExpenses(prev => [...prev, expenseData]);
    }
    setSelectedExpense(null);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = (expense) => {
    setSelectedExpense(expense);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setExpenses(prev => prev.filter(expense => expense.id_depense !== selectedExpense.id_depense));
    setIsDeleteOpen(false);
    setSelectedExpense(null);
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
    return category ? category.icon : Coffee;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.couleur : 'bg-gray-500';
  };

  const getAccountName = (accountId) => {
    const account = comptes.find(c => c.id === accountId);
    return account ? account.nom : 'Compte inconnu';
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.light }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Dépenses</h1>
            <p className="text-gray-600 mt-1">Gérez et analysez vos dépenses quotidiennes</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => {
                setSelectedExpense(null);
                setIsFormOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle dépense</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.secondary }}>
            <h3 className="text-sm font-medium opacity-80">Total des dépenses</h3>
            <p className="text-2xl font-bold mt-2">{totalExpenses.toFixed(2)}€</p>
          </div>
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.primary }}>
            <h3 className="text-sm font-medium opacity-80">Ce mois</h3>
            <p className="text-2xl font-bold mt-2">{monthlyExpenses.toFixed(2)}€</p>
          </div>
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.secondaryDark }}>
            <h3 className="text-sm font-medium opacity-80">Nombre de dépenses</h3>
            <p className="text-2xl font-bold mt-2">{expenses.length}</p>
          </div>
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ backgroundColor: colors.primaryDark }}>
            <h3 className="text-orange-100 text-sm font-medium">Moyenne journalière</h3>
            <p className="text-2xl font-bold mt-2">
              {expenses.length > 0 ? (totalExpenses / 30).toFixed(2) : 0}€
            </p>
          </div>
        </div>

        {/* Statistiques par catégorie */}
        {categoryStats.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dépenses par catégorie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryStats.slice(0, 4).map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 rounded-lg ${stat.couleur} text-white`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{stat.nom}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stat.total.toFixed(2)}€</p>
                    <p className="text-sm text-gray-500">{stat.count} dépense{stat.count > 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une dépense..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nom}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des dépenses */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Description</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Catégorie</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Compte</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-medium">Montant</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-medium">Date</th>
                  <th className="text-center py-4 px-6 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((expense) => {
                  const IconComponent = getCategoryIcon(expense.id_categorie_depense);
                  return (
                    <tr key={expense.id_depense} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-500">ID: {expense.id_depense}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${getCategoryColor(expense.id_categorie_depense)} text-white`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-gray-700">
                            {getCategoryName(expense.id_categorie_depense)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {getAccountName(expense.id_compte)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {expense.montant.toFixed(2)}€
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {new Date(expense.date_depense).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleDetails(expense)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

            {paginatedExpenses.length === 0 && (
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
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredExpenses.length)} sur {filteredExpenses.length} résultats
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Analyse rapide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top catégories */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Top Catégories</span>
            </h3>
            <div className="space-y-3">
              {categoryStats.slice(0, 5).map((stat, index) => {
                const percentage = totalExpenses > 0 ? ((stat.total / totalExpenses) * 100).toFixed(1) : 0;
                const IconComponent = stat.icon;
                return (
                  <div key={stat.id} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm font-medium text-gray-500 w-4">#{index + 1}</span>
                      <div className={`p-2 rounded-lg ${stat.couleur} text-white`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{stat.nom}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{stat.total.toFixed(2)}€</p>
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
                <span className="font-bold text-blue-900">
                  {Math.max(...expenses.map(e => e.montant)).toFixed(2)}€
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <span className="text-green-900 font-medium">Dépense la plus faible</span>
                </div>
                <span className="font-bold text-green-900">
                  {Math.min(...expenses.map(e => e.montant)).toFixed(2)}€
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-900 font-medium">Moyenne par dépense</span>
                </div>
                <span className="font-bold text-purple-900">
                  {expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : 0}€
                </span>
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