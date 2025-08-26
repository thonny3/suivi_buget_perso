"use client"
import React, { useState, useEffect, use } from 'react'
import {
    Plus,
    Search,
    Filter,
    Download,
    Edit3,
    Trash2,
    Eye,
    Calendar,
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft,
    Building,
    User,
    Coffee,
    Car,
    Home,
    Heart,
    ShoppingCart,
    Smartphone,
    Briefcase,
    X,
    Save,
    AlertTriangle
} from 'lucide-react'
import { addDepenses, addRevenues, getTransactions } from '../../../../services/transactionService';
import { categorieDepense, categorieRevenu } from '../../../../services/categorieService';
import { getComptes } from '../../../../services/compteService';

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

// Composant Formulaire Transaction
const TransactionForm = ({ isOpen, onClose, onSave, item = null }) => {
    const [formData, setFormData] = useState({
        description: item?.description || item?.source || '',
        montant: item?.montant || '',
        date: item?.date_depense || item?.date_revenu || new Date().toISOString().split('T')[0],
        type: item?.type || 'depense',
        categorie: item?.id_categorie_depense || item?.id_categorie_revenu || '',
        compte: item?.id_compte || ''
    });

    const [errors, setErrors] = useState({});

    const [categoriesDepenses, setCategoriesDepenses] = useState([]);
    const [categoriesRevenus, setCategoriesRevenus] = useState([]);
    const [comptes, setComptes] = useState([])


    const validateForm = () => {
        const newErrors = {};
        if (!formData.description.trim()) newErrors.description = 'La description est requise';
        if (!formData.montant || formData.montant <= 0) newErrors.montant = 'Le montant doit être positif';
        if (!formData.categorie) newErrors.categorie = 'Veuillez sélectionner une catégorie';
        if (!formData.compte) newErrors.compte = 'Veuillez sélectionner un compte';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchcategoriesDepense = async () => {
        categorieDepense().then(response => {
            console.log("categories depense  avec succès :", response);
            setCategoriesDepenses(response);
        }).catch(error => {
            console.error("Erreur lors de l'ajout de la dépense :", error);
        });
    }

    const fetchcategoriesRevenu = async () => {
        categorieRevenu().then(response => {
            console.log("categories revenu  avec succès :", response);
            setCategoriesRevenus(response);
        }).catch(error => {
            console.error("Erreur lors de l'ajout de la dépense :", error);
        });
    }
    const fetchComptes = async () => {
        getComptes().then(response => {
            console.log("✅ Comptes récupérés :", response);
            setComptes(response);
        }).catch(error => {
            console.error("Erreur lors de la récupération des comptes :", error);
        });
    }

    const handleSubmit = () => {
        if (validateForm()) {

            onSave({
                ...formData,
                id: item?.id || Date.now(),
                montant: parseFloat(formData.montant),
                categorie: parseInt(formData.categorie),
                compte: parseInt(formData.compte)
            });
            onClose();
            setFormData({
                description: '',
                montant: '',
                date: new Date().toISOString().split('T')[0],
                type: 'depense',
                categorie: '',
                compte: ''
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

    useEffect(() => {
        fetchcategoriesDepense();
        fetchcategoriesRevenu();
        fetchComptes();
    }, []);

    const currentCategories = formData.type === 'depense' ? categoriesDepenses : categoriesRevenus;


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={item ? 'Modifier la transaction' : 'Ajouter une transaction'}
            size="md"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de transaction
                    </label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="depense"
                                checked={formData.type === 'depense'}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-red-600">Dépense</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="revenu"
                                checked={formData.type === 'revenu'}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="mr-2"
                            />
                            <span className="text-green-600">Revenu</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description/Source
                    </label>
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder={formData.type === 'depense' ? "Ex: Courses Carrefour" : "Ex: Salaire janvier"}
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
                            className={`w-full outline-none px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.montant ? 'border-red-500' : 'border-gray-300'
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
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            className="w-full outline-none px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                    </label>
                    <select
                        value={formData.categorie}
                        onChange={(e) => handleChange('categorie', e.target.value)}
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.categorie ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        <option value="">Sélectionner une catégorie</option>
                        {currentCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nom}
                            </option>
                        ))}
                    </select>
                    {errors.categorie && <p className="text-red-500 text-sm mt-1">{errors.categorie}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compte
                    </label>
                    <select
                        value={formData.compte}
                        onChange={(e) => handleChange('compte', e.target.value)}
                        className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.compte ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        <option value="">Sélectionner un compte</option>
                        {comptes.map((compte) => (
                            <option key={compte.id_compte} value={compte.id_compte}>
                                {compte.nom} ({compte.type})
                            </option>
                        ))}
                    </select>
                    {errors.compte && <p className="text-red-500 text-sm mt-1">{errors.compte}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            setFormData({
                                description: '',
                                montant: '',
                                date: new Date().toISOString().split('T')[0],
                                type: 'depense',
                                categorie: '',
                                compte: ''
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

// Modal de Confirmation de Suppression
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, transaction }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmer la suppression" size="sm">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 rounded-full p-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Supprimer cette transaction ?
                </h3>
                <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer "{transaction?.description}" ?<br />
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
export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
  const [categoriesDepenses, setCategoriesDepenses] = useState([]);
    const [categoriesRevenus, setCategoriesRevenus] = useState([]);
    const [comptes, setComptes] = useState([])

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    
    const  fetchtransactions = async () => {
        getTransactions().then(response => {
            console.log("✅ Transactions récupérées :", response);
            setTransactions(response);
        }).catch(error => {
            console.error("Erreur lors de la récupération des transactions :", error);
        });
    }
     const fetchcategoriesDepense = async () => {
        categorieDepense().then(response => {
            console.log("categories depense  avec succès :", response);
            setCategoriesDepenses(response);
        }).catch(error => {
            console.error("Erreur lors de l'ajout de la dépense :", error);
        });
    }

    const fetchcategoriesRevenu = async () => {
        categorieRevenu().then(response => {
            console.log("categories revenu  avec succès :", response);
            setCategoriesRevenus(response);
        }).catch(error => {
            console.error("Erreur lors de l'ajout de la dépense :", error);
        });
    }
    const fetchComptes = async () => {
        getComptes().then(response => {
            console.log("✅ Comptes récupérés :", response);
            setComptes(response);
        }).catch(error => {
            console.error("Erreur lors de la récupération des comptes :", error);
        });
    }



    // Filtrage des transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || transaction.type === selectedType;
        const matchesCategory = !selectedCategory || transaction.categorie.toString() === selectedCategory;

        let matchesPeriod = true;
        if (selectedPeriod !== 'all') {
            const transactionDate = new Date(transaction.date);
            const today = new Date();

            switch (selectedPeriod) {
                case 'daily':
                    matchesPeriod = transactionDate.toDateString() === today.toDateString();
                    break;
                case 'weekly':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesPeriod = transactionDate >= weekAgo;
                    break;
                case 'monthly':
                    matchesPeriod = transactionDate.getMonth() === today.getMonth() &&
                        transactionDate.getFullYear() === today.getFullYear();
                    break;
                case 'yearly':
                    matchesPeriod = transactionDate.getFullYear() === today.getFullYear();
                    break;
            }
        }

        return matchesSearch && matchesType && matchesCategory && matchesPeriod;
    });

    const handleSave = (transactionData) => {


        if (selectedTransaction) {
            setTransactions(prev => prev.map(transaction =>
                transaction.id === selectedTransaction.id ? transactionData : transaction
            ));
        } else {
            //setTransactions(prev => [...prev, transactionData]);
            if (transactionData.type === 'depense') {
                setTransactions(prev => [...prev, transactionData]);
                // Appel au service pour ajouter une dépense
                // addDepenses(transactionData);
                console.log("Ajouter une dépense :", transactionData);
                
                addDepenses({ montant: transactionData.montant, date_depense: transactionData.date, description: transactionData.description, id_categorie_depense: transactionData.categorie, id_compte: transactionData.compte }).then(response => {
                    console.log("Dépense ajoutée avec succès :", response);
                }).catch(error => {
                    console.error("Erreur lors de l'ajout de la dépense :", error);
                });

            } else if (transactionData.type === 'revenu') {
                setTransactions(prev => [...prev, transactionData]);
                // Appel au service pour ajouter un revenu
                // addRevenues(transactionData);
                addRevenues({ montant: transactionData.montant, date_revenu: transactionData.date, source: transactionData.description, id_categorie_revenu: transactionData.categorie, id_compte: transactionData.compte }).then(response => {
                    console.log("Revenu ajouté avec succès :", response);
                }).catch(error => {
                    console.error("Erreur lors de l'ajout du revenu :", error);
                });

            }

        }
        setSelectedTransaction(null);
    };

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleDelete = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDeleteOpen(true);
    };

    const confirmDelete = () => {
        setTransactions(prev => prev.filter(transaction => transaction.id !== selectedTransaction.id));
        setIsDeleteOpen(false);
        setSelectedTransaction(null);
    };

    const getCategoryData = (type, categoryId) => {
        const categories = type === 'depense' ? categoriesDepenses : categoriesRevenus;
        return categories.find(c => c.id === categoryId) || { nom: 'Sans catégorie', couleur: 'bg-gray-500', icon: DollarSign };
    };

    const getAccountName = (accountId) => {
        const account = comptes.find(c => c.id === accountId);
        return account ? account.nom : 'Compte inconnu';
    };

    const periodButtons = [
        { key: 'all', label: 'Tout' },
        { key: 'daily', label: 'Aujourd\'hui' },
        { key: 'weekly', label: 'Cette semaine' },
        { key: 'monthly', label: 'Ce mois' },
        { key: 'yearly', label: 'Cette année' }
    ];

    useEffect(() => {
        fetchtransactions();
        fetchcategoriesDepense();
        fetchcategoriesRevenu();
        fetchComptes();
    });

    const allCategories = [...categoriesDepenses, ...categoriesRevenus];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* En-tête */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes Transactions</h1>
                        <p className="text-gray-600 mt-1">Gérez vos revenus et dépenses en un seul endroit</p>
                    </div>
                    <div className="flex space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={() => {
                                setSelectedTransaction(null);
                                setIsFormOpen(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Nouvelle transaction</span>
                        </button>
                    </div>
                </div>

                {/* Filtres par période */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {periodButtons.map((period) => (
                            <button
                                key={period.key}
                                onClick={() => setSelectedPeriod(period.key)}
                                className={`px-4 py-2 rounded-lg transition-colors ${selectedPeriod === period.key
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Rechercher une transaction..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>

                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Tous les types</option>
                                <option value="depense">Dépenses</option>
                                <option value="revenu">Revenus</option>
                            </select>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="">Toutes les catégories</option>
                                <optgroup label="Dépenses">
                                    {categoriesDepenses.map((cat) => (
                                        <option key={`dep-${cat.id}`} value={cat.id}>{cat.nom}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Revenus">
                                    {categoriesRevenus.map((cat) => (
                                        <option key={`rev-${cat.id}`} value={cat.id}>{cat.nom}</option>
                                    ))}
                                </optgroup>
                            </select>

                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tableau des Transactions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 text-gray-600 font-medium">Type</th>
                                    <th className="text-left py-4 px-6 text-gray-600 font-medium">Description</th>
                                    <th className="text-left py-4 px-6 text-gray-600 font-medium">Catégorie</th>
                                    <th className="text-left py-4 px-6 text-gray-600 font-medium">Compte</th>
                                    <th className="text-right py-4 px-6 text-gray-600 font-medium">Montant</th>
                                    <th className="text-left py-4 px-6 text-gray-600 font-medium">Date</th>
                                    <th className="text-center py-4 px-6 text-gray-600 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction) => {
                                    const categoryData = getCategoryData(transaction.type, transaction.categorie);
                                    const IconComponent = categoryData.icon;
                                    return (
                                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    {transaction.type === 'depense' ? (
                                                        <ArrowDownLeft className="w-4 h-4 text-red-500" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                                                    )}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'depense'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {transaction.type === 'depense' ? 'Dépense' : 'Revenu'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-medium text-gray-900">{transaction.description}</p>
                                                    <p className="text-sm text-gray-500">ID: {transaction.id}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-2">
                                                    <div className={`p-2 rounded-lg ${categoryData.couleur} text-white`}>
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm text-gray-700">
                                                        {categoryData.nom}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-600">
                                                    {getAccountName(transaction.compte)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`text-lg font-bold ${transaction.type === 'depense' ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {transaction.type === 'depense' ? '-' : '+'}{transaction.montant}€
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(transaction)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transaction)}
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

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12">
                                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Aucune transaction trouvée</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {filteredTransactions.length === 0 && transactions.length > 0
                                        ? "Essayez de modifier vos filtres de recherche"
                                        : "Commencez par ajouter votre première transaction"
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TransactionForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedTransaction(null);
                }}
                onSave={handleSave}
                item={selectedTransaction}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedTransaction(null);
                }}
                onConfirm={confirmDelete}
                transaction={selectedTransaction}
            />
        </div>
    );
}